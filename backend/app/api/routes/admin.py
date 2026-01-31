from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.api.deps import get_current_admin_user
from app.models import User, Ride, Booking, RideRequest
from app.models.audit import AuditLog
from app.schemas import UserResponse, RideResponse, BookingResponse
from app.services.audit_service import AuditService
from pydantic import BaseModel

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Role check handled by dependency
    
    total_users = db.query(func.count(User.id)).scalar()
    total_rides = db.query(func.count(Ride.id)).scalar()
    active_rides = db.query(func.count(Ride.id)).filter(Ride.status == "active").scalar()
    total_bookings = db.query(func.count(Booking.id)).scalar()
    
    # Calculate Revenue (Sum of fee_amount for paid bookings)
    total_revenue = db.query(func.sum(Booking.fee_amount)).filter(Booking.payment_status == "approved").scalar() or 0.0

    # Fetch recent users for preview
    recent_users = db.query(User).order_by(User.id.desc()).limit(5).all()

    return {
        "total_users": total_users,
        "total_rides": total_rides,
        "active_rides": active_rides,
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
        "users_preview": recent_users
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 50,
    verification_status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    query = db.query(User)
    
    if verification_status:
        query = query.filter(User.verification_status == verification_status)
        
    users = query.order_by(User.id.desc()).offset(skip).limit(limit).all()
    return users

@router.get("/rides", response_model=List[RideResponse])
def get_all_rides(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    rides = db.query(Ride).order_by(Ride.created_at.desc()).offset(skip).limit(limit).all()
    return rides

@router.get("/bookings", response_model=List[BookingResponse])
def get_all_bookings(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()
    return bookings

@router.get("/logs")
def get_all_logs(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
    return logs

class VerificationRequest(BaseModel):
    status: str # "approved" or "rejected"

@router.post("/users/{user_id}/verify")
def verify_user(
    user_id: int,
    payload: VerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Aprueba o rechaza la verificación de identidad de un usuario.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    if payload.status == "approved":
        user.is_verified = True
        user.verification_status = "verified"
        msg = "Usuario verificado exitosamente."
    elif payload.status == "rejected":
        user.is_verified = False
        user.verification_status = "rejected"
        msg = "Verificación rechazada."
    else:
        raise HTTPException(status_code=400, detail="Estado inválido (use 'approved' o 'rejected')")
        
    db.commit()
    
    # Audit
    AuditService.log(db, "VERIFICATION_DECIDED", user_id=current_user.id, details={
        "target_user_id": user.id, 
        "decision": payload.status
    })
    
    return {"message": msg, "user_status": user.verification_status}
