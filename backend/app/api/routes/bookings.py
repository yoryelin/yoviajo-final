"""
Rutas de Reservas (Bookings).
Permite a los pasajeros reservar asientos en viajes ofrecidos.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.ride import Ride
from app.models.booking import Booking, BookingStatus
from app.schemas.booking import BookingCreate, BookingResponse, BookingUpdate
from app.api.deps import get_current_user
from app import utils
from datetime import datetime
from app.core.logger import logger

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def calculate_total_price(ride: Ride, seats: int) -> int:
    """Calcula el precio total de la reserva."""
    return ride.price * seats


@router.get("/", response_model=List[BookingResponse])
def get_bookings(db: Session = Depends(get_db)):
    """
    Obtener todas las reservas (público para ver disponibilidad).
    """
    bookings = db.query(Booking).all()
    result = []
    for booking in bookings:
        booking_dict = BookingResponse.from_orm(booking).dict()
        # Agregar información del viaje
        if booking.ride:
            booking_dict['ride_origin'] = booking.ride.origin
            booking_dict['ride_destination'] = booking.ride.destination
            booking_dict['ride_departure_time'] = booking.ride.departure_time
            booking_dict['ride_price'] = booking.ride.price
            booking_dict['driver_name'] = booking.ride.driver.name if booking.ride.driver else None
            
            # Agregar geolocalización del viaje
            booking_dict['maps_url'] = utils.generate_google_maps_url(
                booking.ride.origin,
                booking.ride.destination,
                booking.ride.origin_lat,
                booking.ride.origin_lng,
                booking.ride.destination_lat,
                booking.ride.destination_lng
            )
        
        # Agregar información del pasajero
        if booking.passenger:
            booking_dict['passenger_name'] = booking.passenger.name
        
        result.append(booking_dict)
    return result


@router.get("/me", response_model=List[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener mis reservas. Requiere autenticación.
    """
    try:
        # Mostrar reservas de viajes futuros o recientes (últimas 24hs)
        from datetime import timedelta
        limit_date = datetime.now() - timedelta(hours=24)
        
        bookings = db.query(Booking).join(Ride).filter(
            Booking.passenger_id == current_user.id,
            Ride.departure_time >= limit_date
        ).all()
        result = []
        for booking in bookings:
            try:
                booking_dict = BookingResponse.from_orm(booking).dict()
                # Agregar información del viaje
                if booking.ride:
                    booking_dict['ride_origin'] = booking.ride.origin
                    booking_dict['ride_destination'] = booking.ride.destination
                    booking_dict['ride_departure_time'] = booking.ride.departure_time
                    booking_dict['ride_price'] = booking.ride.price
                    booking_dict['driver_name'] = booking.ride.driver.name if booking.ride.driver else None
                    
                    # Agregar geolocalización del viaje - ¡CORAZÓN DEL SISTEMA!
                    booking_dict['maps_url'] = utils.generate_google_maps_url(
                        booking.ride.origin,
                        booking.ride.destination,
                        booking.ride.origin_lat,
                        booking.ride.origin_lng,
                        booking.ride.destination_lat,
                        booking.ride.destination_lng
                    )

                    # Unlock Contact Info IF Paid
                    if booking.payment_status == "paid":
                        booking_dict['driver_phone'] = booking.ride.driver.phone if booking.ride.driver else None
                
                booking_dict['passenger_name'] = current_user.name
                result.append(booking_dict)
            except Exception as e:
                print(f"Skipping corrupt booking {booking.id}: {e}")
                continue
        return result
    except Exception as e:
         print(f"CRITICAL ERROR in get_my_bookings: {e}")
         raise HTTPException(status_code=500, detail=f"Debug Error: {str(e)}")


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear una nueva reserva. Requiere autenticación.
    
    Validaciones:
    - El viaje debe existir y estar activo
    - Debe haber asientos disponibles suficientes
    - El usuario no puede reservar en su propio viaje
    - El usuario no puede tener una reserva duplicada para el mismo viaje
    """
    # Verificar que el viaje existe (Con bloqueo p/ evitar race conditions en asientos)
    ride = db.query(Ride).filter(Ride.id == booking.ride_id).with_for_update().first()
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Viaje no encontrado"
        )
    
    # Validar que el usuario no es el conductor
    if ride.driver_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes reservar en tu propio viaje"
        )
    
    # Verificar asientos disponibles
    # Contar reservas confirmadas/pendientes para este viaje
    existing_bookings = db.query(Booking).filter(
        Booking.ride_id == booking.ride_id,
        Booking.status.in_([BookingStatus.PENDING.value, BookingStatus.CONFIRMED.value])
    ).all()
    
    seats_taken = sum(b.seats_booked for b in existing_bookings)
    seats_available = ride.available_seats - seats_taken
    
    if seats_available < booking.seats_booked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No hay suficientes asientos disponibles. Disponibles: {seats_available}, Solicitados: {booking.seats_booked}"
        )
    
    # Verificar que no existe una reserva pendiente/confirmada del mismo usuario
    existing_booking = db.query(Booking).filter(
        Booking.ride_id == booking.ride_id,
        Booking.passenger_id == current_user.id,
        Booking.status.in_([BookingStatus.PENDING.value, BookingStatus.CONFIRMED.value])
    ).first()
    
    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya tienes una reserva activa para este viaje"
        )
    
    # Crear la reserva
    new_booking = Booking(
        ride_id=booking.ride_id,
        passenger_id=current_user.id,
        seats_booked=booking.seats_booked,
        status=BookingStatus.AWAITING_PAYMENT.value,
        payment_status="unpaid",
        fee_amount=5000.0 # Fixed Fee explicit assignment
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    # AUDIT LOG
    utils.log_audit(db, "BOOKING_CREATED", {"ride_id": booking.ride_id, "seats": booking.seats_booked}, current_user.id)
    
    # Construir respuesta con información completa del viaje y geolocalización
    booking_dict = BookingResponse.from_orm(new_booking).dict()
    booking_dict['ride_origin'] = ride.origin
    booking_dict['ride_destination'] = ride.destination
    booking_dict['ride_departure_time'] = ride.departure_time
    booking_dict['ride_price'] = ride.price
    booking_dict['driver_name'] = ride.driver.name if ride.driver else None
    booking_dict['passenger_name'] = current_user.name
    
    # ¡Geolocalización - Corazón del sistema!
    booking_dict['maps_url'] = utils.generate_google_maps_url(
        ride.origin,
        ride.destination,
        ride.origin_lat,
        ride.origin_lng,
        ride.destination_lat,
        ride.destination_lng
    )

    # ---------------------------------------------------------
    # MONETIZATION: GENERATE MERCADOPAGO PREFERENCE
    # ---------------------------------------------------------
    try:
        from app.services.payment_service import PaymentService
        payment_service = PaymentService()
        
        preference = payment_service.create_preference(
            booking_id=new_booking.id,
            title=f"Reserva de Viaje: {ride.origin} -> {ride.destination}",
            price=new_booking.fee_amount, # Fixed Fee (5000)
            payer_email=current_user.email
        )
        
        if preference:
            booking_dict['payment_init_point'] = preference['init_point']
            logger.info(f"MP Preference created for booking {new_booking.id}: {preference['init_point']}")
        else:
            logger.error(f"Failed to create MP Preference for booking {new_booking.id}")
            
    except Exception as e:
        logger.error(f"Payment Integration Error: {e}")
        # No fallamos la reserva, pero el usuario no tendrá link de pago (deberá reintentar)

    return booking_dict


@router.patch("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    booking_update: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar una reserva (cancelar, confirmar, etc.).
    Requiere autenticación.
    
    Validaciones:
    - Solo el pasajero puede cancelar su reserva
    - Solo el conductor puede confirmar/cancelar reservas de su viaje
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva no encontrada"
        )
    
    # Verificar permisos
    is_passenger = booking.passenger_id == current_user.id
    is_driver = booking.ride.driver_id == current_user.id if booking.ride else False
    
    if not (is_passenger or is_driver):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para modificar esta reserva"
        )
    
    # Actualizar campos
    if booking_update.status is not None:
        # Solo permitir cancelar si eres pasajero, o confirmar/cancelar si eres conductor
        if booking_update.status == BookingStatus.CANCELLED.value and not is_passenger and not is_driver:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo puedes cancelar tus propias reservas"
            )
            
        # NUEVA REGLA: Penalización para Pasajeros
        # Si el pasajero cancela con menos de 6 horas de anticipación
        penalty_applied = False
        if booking_update.status == BookingStatus.CANCELLED.value and is_passenger:
            logger.debug(f"Checking passenger penalty. Ride: {booking.ride}")
            # Parsear fecha salida
            try:
                if booking.ride and isinstance(booking.ride.departure_time, str):
                    dep_dt = datetime.fromisoformat(booking.ride.departure_time.replace('Z', '+00:00'))
                elif booking.ride:
                    dep_dt = booking.ride.departure_time
                else:
                     logger.warning("No Ride found attached to booking!")
                     dep_dt = datetime.now()
            except Exception as e:
                logger.error(f"Error parsing date: {e}")
                dep_dt = datetime.now() # Fallback safe
            
            if utils.is_within_penalty_window(dep_dt, hours=24):
                utils.apply_reputation_penalty(current_user, 20)
                penalty_applied = True
        
        booking.status = booking_update.status
    
    if booking_update.seats_booked is not None:
        # Validar asientos disponibles si se cambia la cantidad
        if booking_update.seats_booked != booking.seats_booked:
            existing_bookings = db.query(Booking).filter(
                Booking.ride_id == booking.ride_id,
                Booking.id != booking_id,
                Booking.status.in_([BookingStatus.PENDING.value, BookingStatus.CONFIRMED.value])
            ).all()
            seats_taken = sum(b.seats_booked for b in existing_bookings)
            seats_available = booking.ride.available_seats - seats_taken
            
            if seats_available < booking_update.seats_booked:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"No hay suficientes asientos disponibles. Disponibles: {seats_available}"
                )
            booking.seats_booked = booking_update.seats_booked
    
    booking.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(booking)
    
    # AUDIT LOG
    if booking.status == BookingStatus.CANCELLED.value:
         utils.log_audit(db, "BOOKING_CANCELLED", {
             "booking_id": booking.id, 
             "ride_id": booking.ride_id,
             "penalty_applied": penalty_applied if 'penalty_applied' in locals() else False,
             "new_reputation": current_user.reputation_score if is_passenger else None
         }, current_user.id)
    
    # Construir respuesta con información completa
    booking_dict = BookingResponse.from_orm(booking).dict()
    if booking.ride:
        booking_dict['ride_origin'] = booking.ride.origin
        booking_dict['ride_destination'] = booking.ride.destination
        booking_dict['ride_departure_time'] = booking.ride.departure_time
        booking_dict['ride_price'] = booking.ride.price
        booking_dict['driver_name'] = booking.ride.driver.name if booking.ride.driver else None
        
        # Geolocalización
        booking_dict['maps_url'] = utils.generate_google_maps_url(
            booking.ride.origin,
            booking.ride.destination,
            booking.ride.origin_lat,
            booking.ride.origin_lng,
            booking.ride.destination_lat,
            booking.ride.destination_lng
        )
    
    booking_dict['passenger_name'] = booking.passenger.name if booking.passenger else None
    
    return booking_dict


@router.get("/ride/{ride_id}", response_model=List[BookingResponse])
def get_ride_bookings(
    ride_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener todas las reservas de un viaje específico.
    Solo el conductor puede ver las reservas de su viaje.
    """
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Viaje no encontrado"
        )
    
    # Solo el conductor puede ver las reservas de su viaje
    if ride.driver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el conductor puede ver las reservas de su viaje"
        )
    
    bookings = db.query(Booking).filter(Booking.ride_id == ride_id).all()
    result = []
    for booking in bookings:
        booking_dict = BookingResponse.from_orm(booking).dict()
        booking_dict['ride_origin'] = ride.origin
        booking_dict['ride_destination'] = ride.destination
        booking_dict['ride_departure_time'] = ride.departure_time
        booking_dict['ride_price'] = ride.price
        booking_dict['driver_name'] = ride.driver.name if ride.driver else None
        booking_dict['driver_name'] = ride.driver.name if ride.driver else None
        booking_dict['passenger_name'] = booking.passenger.name if booking.passenger else None
        
        # Unlock Contact Info IF Paid
        if booking.payment_status == "paid":
             booking_dict['passenger_phone'] = booking.passenger.phone if booking.passenger else None # WhatsApp Contact
        else:
             booking_dict['passenger_phone'] = None
             
        # Geolocalización
        booking_dict['maps_url'] = utils.generate_google_maps_url(
            ride.origin,
            ride.destination,
            ride.origin_lat,
            ride.origin_lng,
            ride.destination_lat,
            ride.destination_lng
        )
        
        result.append(booking_dict)
    return result


