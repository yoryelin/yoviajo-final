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

    if current_user.role == 'C': # Conductor
        # 1. Obtener mis viajes activos
        my_rides = db.query(Ride).filter(Ride.driver_id == current_user.id, Ride.status == 'active').all()
        
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
                    "details": {
                        "origin": req.origin,
                        "destination": req.destination,
                        "date": req.date,
                        "price_proposal": req.proposed_price
                    }
                })
                
    else: # Pasajero
        # 1. Obtener mis solicitudes activas
        # TODO: Filtrar por status si implementamos estado en Request
        my_requests = db.query(RideRequest).filter(RideRequest.passenger_id == current_user.id).all()
        
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
                    "details": {
                        "origin": ride.origin,
                        "destination": ride.destination,
                        "date": ride.departure_time, # ISO String
                        "price": ride.price,
                        "car": f"{driver.car_model} - {driver.car_color}"
                    }
                })
    
    return matches_result
