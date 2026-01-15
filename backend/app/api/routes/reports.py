
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.ride import Ride
from app.models.booking import Booking, BookingStatus
from app.api.deps import get_current_user
from app import utils
from datetime import datetime, timedelta
from pydantic import BaseModel

class ReportCreate(BaseModel):
    ride_id: int
    target_user_id: int
    reason: str = "no_show"

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def report_user(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reportar a un usuario por No-Show (Ausencia).
    - Solo permitido DESPUÉS de la hora del viaje.
    - Solo permitido si existía una reserva confirmada entre las partes.
    - Aplica penalización severa (-20 puntos).
    """
    
    # 1. Validar Viaje
    ride = db.query(Ride).filter(Ride.id == report.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")

    # 2. Validar Hora (Solo Reportar DESPUÉS del viaje)
    # Parse departure time safely
    try:
        if isinstance(ride.departure_time, str):
            dep_dt = datetime.fromisoformat(ride.departure_time.replace('Z', '+00:00'))
        else:
            dep_dt = ride.departure_time
            
        if not dep_dt.tzinfo:
            now = datetime.now()
        else:
            now = datetime.now(dep_dt.tzinfo)
            
        if now < dep_dt:
             raise HTTPException(status_code=400, detail="No puedes reportar antes de la hora del viaje")
             
    except Exception as e:
        print(f"Date error: {e}")
        # Fallback? No, if we can't verify time, we shouldn't allow penalty.
        raise HTTPException(status_code=400, detail="Error validando horario del viaje")

    # 3. Validar Relación (Driver reporting Passenger OR Passenger reporting Driver)
    is_driver = ride.driver_id == current_user.id
    target_is_passenger = False
    
    # Buscar la reserva que los vincula
    booking = None
    
    if is_driver:
        # Conductor reportando a Pasajero
        booking = db.query(Booking).filter(
            Booking.ride_id == ride.id,
            Booking.passenger_id == report.target_user_id,
            Booking.status == BookingStatus.CONFIRMED.value
        ).first()
        if not booking:
            raise HTTPException(status_code=400, detail="No existe una reserva confirmada con este pasajero")
            
    else:
        # Pasajero reportando a Conductor
        # Verificar que el target sea el conductor
        if ride.driver_id != report.target_user_id:
             raise HTTPException(status_code=400, detail="El usuario reportado no es el conductor de este viaje")
        
        # Verificar que YO tengo reserva confirmada
        booking = db.query(Booking).filter(
            Booking.ride_id == ride.id,
            Booking.passenger_id == current_user.id,
            Booking.status == BookingStatus.CONFIRMED.value
        ).first()
        if not booking:
             raise HTTPException(status_code=400, detail="No tienes una reserva confirmada para este viaje")

    # 4. Validar que no se haya reportado ya (Opcional, pero bueno para evitar spam)
    # Por ahora simplificado: Si ya tiene muchas penalizaciones quizas? 
    # Idealmente tendriamos una tabla 'Reports', pero para este MVP aplicamos penalización directa y Log audit.
    
    # 5. Aplicar Penalización al Target
    target_user = db.query(User).filter(User.id == report.target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuario reportado no encontrado")
        
    target_user.reputation_score = max(0, target_user.reputation_score - 20)
    # Podríamos sumar cancellation_count o tener un 'report_count'
    
    db.commit()
    
    # 6. Audit Log
    utils.log_audit(db, "USER_REPORTED_NOSHOW", {
        "reporter_id": current_user.id,
        "target_id": target_user.id,
        "ride_id": ride.id,
        "new_target_reputation": target_user.reputation_score
    }, current_user.id)
    
    return {
        "message": "Reporte enviado. Se ha penalizado al usuario.",
        "new_target_reputation": target_user.reputation_score 
    }
