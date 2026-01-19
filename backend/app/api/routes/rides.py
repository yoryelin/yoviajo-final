"""
Rutas de Viajes (Ofertas de conductores).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.ride import Ride, RideRequest
from app.schemas.ride import RideCreate, RideResponse
from app.api.deps import get_current_user
from app import utils
from datetime import datetime, timedelta
from app.models.booking import Booking, BookingStatus

router = APIRouter(prefix="/api/rides", tags=["rides"])


@router.get("", response_model=List[RideResponse])
def get_rides(
    women_only: bool = False,
    allow_pets: bool = False,
    allow_smoking: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Now we need user to filter women_only safety
):
    """
    Obtener todas las ofertas de viajes activas.
    Soporta filtros por atributos de confianza.
    """
    try:
        query = db.query(Ride)
        
        # 1. Filtros básicos
        if allow_pets:
            query = query.filter(Ride.allow_pets == True)
        if allow_smoking:
            query = query.filter(Ride.allow_smoking == True)

        # 2. Women Only Logic (Bidirectional Safe Space)
        
        # A) Safety Rule: Hombres NUNCA ven viajes marcados como 'women_only'
        if current_user.gender == 'M':
             query = query.filter(Ride.women_only == False)
             # Si un hombre intenta forzar el filtro, lo ignoramos o retornamos vacío
             if women_only:
                 return []

        # B) Search Filter: Pasajera busca "Solo Conductoras" o Viajes Seguros
        if women_only:
            if current_user.gender != 'F':
                # Protección extra: Solo mujeres pueden activar este filtro activamente
                 raise HTTPException(status_code=400, detail="El filtro 'Solo Mujeres' es exclusivo para usuarias.")
            
            # Filtrar: 
            # 1. Viajes marcados como women_only=True (Exclusivos)
            # OR
            # 2. Viajes donde la conductora es Mujer (aunque sea abierto)
            # La consigna dice: "viajar solo con un conductor mujer".
            # Así que filtramos por género del conductor.
            query = query.join(User, Ride.driver_id == User.id).filter(User.gender == 'F')

        rides = query.all()
        
        result = []
        for ride in rides:
            try:
                ride_dict = RideResponse.from_orm(ride).dict()
                ride_dict['maps_url'] = utils.generate_google_maps_url(
                    ride.origin,
                    ride.destination,
                    ride.origin_lat,
                    ride.origin_lng,
                    ride.destination_lat,
                    ride.destination_lng

                )
                # Calcular reservas activas
                active_bookings = [b for b in ride.bookings if b.status != BookingStatus.CANCELLED.value]
                ride_dict['bookings_count'] = len(active_bookings)
                result.append(ride_dict)
            except Exception as e:
                print(f"Skipping corrupt ride {ride.id}: {e}")
                continue
        return result
    except Exception as e:
        print(f"CRITICAL ERROR in get_rides: {e}")
        raise HTTPException(status_code=500, detail=f"Debug Error: {str(e)}")

@router.post("", response_model=RideResponse)
def create_ride(
    ride: RideCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear una nueva oferta de viaje. Requiere autenticación.
    """
    try:
        # Validar ventana de tiempo (72 horas)
        try:
            # Formatos posibles que vienen del frontend
            departure_dt = datetime.fromisoformat(ride.departure_time.replace('Z', '+00:00'))
        except ValueError:
            # Fallback si el formato no es ISO standard
            raise HTTPException(status_code=400, detail="Formato de fecha inválido")

        now = datetime.now(departure_dt.tzinfo)
        
        # 1. No en el pasado (con 15 min de gracia)
        if departure_dt < now - timedelta(minutes=15):
            raise HTTPException(status_code=400, detail="El viaje no puede ser en el pasado")
            
        # 2. No más de 72 horas
        if departure_dt > now + timedelta(hours=72):
            raise HTTPException(status_code=400, detail="Solo se pueden publicar viajes dentro de las próximas 72 horas")

        ride_data = ride.dict()
        
        # Asegurar que solo conductoras mujeres puedan activar 'women_only'
        if ride_data.get('women_only') and current_user.gender != 'F':
             raise HTTPException(status_code=400, detail="Solo conductoras mujeres pueden crear viajes exclusivos para mujeres")

        new_ride = Ride(**ride_data, driver_id=current_user.id, status="active")
        db.add(new_ride)
        db.commit()
        db.refresh(new_ride)
        
        # AUDIT LOG
        utils.log_audit(db, "RIDE_CREATED", {"ride_id": new_ride.id, "origin": new_ride.origin, "women_only": new_ride.women_only}, current_user.id)
        
        # Agregar enlace de Maps a la respuesta
        result = RideResponse.from_orm(new_ride).dict()
        result['maps_url'] = utils.generate_google_maps_url(
            new_ride.origin,
            new_ride.destination,
            new_ride.origin_lat,
            new_ride.origin_lng,
            new_ride.destination_lat,
            new_ride.destination_lng
        )
        result['bookings_count'] = 0 # Recién creado
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"CRITICAL ERROR creating ride: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error Interno: {str(e)}")


@router.delete("/{ride_id}")
def cancel_ride(
    ride_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancelar un viaje. Solo el conductor puede hacerlo.
    Esto cancelará todas las reservas asociadas.
    
    Regla de Negocio:
    - Si faltan MENOS de 24 horas: Penalización SEVERA (Reputación -20).
    - Si faltan MÁS de 24 horas: Sin penalización.
    """
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
        
    if ride.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para cancelar este viaje")
        
    if ride.status == "cancelled":
        raise HTTPException(status_code=400, detail="El viaje ya está cancelado")

    # Cancelar el viaje
    ride.status = "cancelled"
    
    # Cancelar todas las reservas asociadas
    bookings = db.query(Booking).filter(Booking.ride_id == ride.id, Booking.status != BookingStatus.CANCELLED.value).all()
    count_affected = 0
    for booking in bookings:
        booking.status = BookingStatus.CANCELLED.value
        count_affected += 1
        
    # Verificar ventana de tiempo para penalización
    # Convertir string ISO a datetime si es necesario
    try:
        if isinstance(ride.departure_time, str):
            curr_departure_dt = datetime.fromisoformat(ride.departure_time.replace('Z', '+00:00'))
        else:
            curr_departure_dt = ride.departure_time
    except ValueError:
        # Fallback safe (asumir penalización si la fecha está corrupta? o no? Mejor proteger al usuario)
        curr_departure_dt = datetime.now() # Esto haría que is_within sea True siempre si es pasado o muy cercano
    
    is_penalty_time = utils.is_within_penalty_window(curr_departure_dt, hours=24)

    # Aplicar penalización si había reservas afectadas Y estamos en ventana de castigo
    penalty_applied = False
    new_reputation = current_user.reputation_score
    
    if count_affected > 0 and is_penalty_time:
        new_reputation = utils.apply_reputation_penalty(current_user, 20)
        penalty_applied = True
        
    db.commit()
    
    # AUDIT LOG
    utils.log_audit(db, "RIDE_CANCELLED", {
        "ride_id": ride.id, 
        "bookings_affected": count_affected,
        "penalty_applied": penalty_applied,
        "is_within_6h": is_penalty_time,
        "new_reputation": new_reputation
    }, current_user.id)
    
    msg = "Viaje cancelado exitosamente."
    if count_affected > 0:
        if penalty_applied:
            msg += " Se aplicó una penalización en su reputación por cancelar con menos de 6 horas de antelación."
        else:
            msg += " No se aplicó penalización (cancelación anticipada)."
            
    return {
        "message": msg,
        "bookings_cancelled": count_affected,
        "new_reputation": new_reputation,
        "penalty_applied": penalty_applied
    }


@router.get("/me", response_model=List[RideResponse])
def get_my_rides(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener mis viajes publicados. Requiere autenticación.
    """
    try:
        rides = db.query(Ride).filter(Ride.driver_id == current_user.id).all()
        result = []
        for ride in rides:
            try:
                ride_dict = RideResponse.from_orm(ride).dict()
                ride_dict['maps_url'] = utils.generate_google_maps_url(
                    ride.origin,
                    ride.destination,
                    ride.origin_lat,
                    ride.origin_lng,
                    ride.destination_lat,
                    ride.destination_lng
                )

                # Calcular reservas activas
                active_bookings = [b for b in ride.bookings if b.status != BookingStatus.CANCELLED.value]
                ride_dict['bookings_count'] = len(active_bookings)
                
                # Calcular coincidencias (Solicitudes de pasajeros con mismo Origen/Destino)
                matches = db.query(RideRequest).filter(
                    RideRequest.origin == ride.origin,
                    RideRequest.destination == ride.destination
                ).count()
                ride_dict['matches_count'] = matches

                result.append(ride_dict)
            except Exception as e:
                print(f"ERROR processing ride {ride.id}: {e}")
                # Continue with other rides or raise? Let's skip bad rides to prevent full crash
                continue 
        return result
    except Exception as e:
        print(f"CRITICAL ERROR in get_my_rides: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Debug Error: {str(e)}")

