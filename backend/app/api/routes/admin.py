from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.api.deps import get_current_admin_user
from app.models import User, Ride, Booking, RideRequest
from app.schemas import UserResponse, RideResponse, BookingResponse

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
    
    # Fetch recent users for preview
    recent_users = db.query(User).order_by(User.id.desc()).limit(5).all()

    return {
        "total_users": total_users,
        "total_rides": total_rides,
        "active_rides": active_rides,
        "total_bookings": total_bookings,
        "users_preview": recent_users
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    users = db.query(User).offset(skip).limit(limit).all()
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
