from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from app.database import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.utils.matching import find_matches_for_ride, find_matches_for_request
from app.models.ride import Ride, RideRequest
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/matches", tags=["matches"])

@router.get("", response_model=List[dict]) 
def get_my_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener coincidencias inteligentes para el usuario actual.
    Si es Pasajero: Busca Conductores (Rides) que coincidan con sus solicitudes recientes.
    Si es Conductor: Busca Pasajeros (Requests) que coincidan con sus viajes publicados.
    Retorna una lista simple enriquecida para el Frontend.
    """
    matches_result = []
    
    from datetime import datetime
    now = datetime.now()

    today_str = now.strftime("%Y-%m-%d")
    now_iso = now.strftime("%Y-%m-%dT%H:%M")

    if current_user.role == 'C': # Conductor
        # 1. Obtener mis viajes activos y FUTUROS
        my_rides = db.query(Ride).filter(
            Ride.driver_id == current_user.id, 
            Ride.status == 'active',
            Ride.departure_time >= now_iso # Filter expired rides (String comparison)
        ).all()
        
        for ride in my_rides:
            # Buscar Requests que encajen
            candidates = find_matches_for_ride(ride, db)
            for req in candidates:
                passenger = req.passenger
                matches_result.append({
                    "type": "PASSENGER_FOUND",
                    "match_score": 95, # Mock score por ahora
                    "ride_id": ride.id,
                    "request_id": req.id,
                    "candidate_user": {
                        "id": passenger.id,
                        "name": passenger.name,
                        "age": passenger.age, # Property recalculada
                        "reputation": passenger.reputation_score,
                        "photo": None # TODO: Avatar url
                    },
                    "origin": req.origin,
                    "destination": req.destination,
                    "date": req.date,
                    "price_proposal": req.proposed_price
                })
                
    else: # Pasajero
        # 1. Obtener mis solicitudes activas y FUTURAS
        today_str = now.strftime("%Y-%m-%d")
        my_requests = db.query(RideRequest).filter(
            RideRequest.passenger_id == current_user.id,
            RideRequest.date >= today_str # Filter expired requests
        ).all()
        
        for req in my_requests:
            candidates = find_matches_for_request(req, db)
            for ride in candidates:
                driver = ride.driver
                matches_result.append({
                    "type": "RIDE_FOUND",
                    "match_score": 95,
                    "request_id": req.id,
                    "ride_id": ride.id,
                    "candidate_user": {
                        "id": driver.id,
                        "name": driver.name,
                        "age": driver.age,
                        "reputation": driver.reputation_score,
                        "photo": None
                    },
                    "origin": ride.origin,
                    "destination": ride.destination,
                    "date": ride.departure_time, # ISO String
                    "price": ride.price,
                    "car_model": driver.car_model,
                    "car_color": driver.car_color
                })
    
    return matches_result

@router.post("/invite")
def invite_passenger(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permite al conductor 'Ofrecer Lugar' (Invitar) a un pasajero compatible.
    Envía una notificación (Mock/Email) al pasajero para que realice el pago.
    """
    # Payload espera: {"request_id": int, "ride_id": int}
    req_id = payload.get("request_id")
    ride_id = payload.get("ride_id")
    
    if not req_id or not ride_id:
        raise HTTPException(status_code=400, detail="Faltan datos (request_id, ride_id)")

    request = db.query(RideRequest).filter(RideRequest.id == req_id).first()
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    
    if not request or not ride:
        raise HTTPException(status_code=404, detail="Solicitud o Viaje no encontrado")
        
    if ride.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="No eres el conductor de este viaje")
        
    # Enviar Notificación
    from app.services.email_service import EmailService
    email_service = EmailService()
    
    # Mock Notification Logic since we check 'enabled' inside service
    # In a real app, this would send an email with a link like: https://yoviajo.com.ar/pay?ride_id=...
    
    try:
        # Usamos send_welcome_email como base o creamos uno nuevo generic
        # Por ahora logueamos y retornamos OK
        print(f"📧 SENDING INVITE TO {request.passenger.email}: 'El conductor {current_user.name} te ha ofrecido lugar para {ride.origin}-{ride.destination}. Entra a la app para pagar y confirmar.'")
    except Exception as e:
        print(f"Error sending invite email: {e}")

    return {"message": "Invitación enviada correctamente. El pasajero ha sido notificado."}
