from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.api.deps import get_current_active_user
from app.models import User, Ride, Booking, RideRequest

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Requires admin privileges"
        )
    
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

@router.get("/users")
def get_all_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = db.query(User).offset(skip).limit(limit).all()
    # Return a simplified list or list of Pydantic models. 
    # For speed, we return dictionaries, but ideally we use a response_model.
    # We'll rely on generic serialization for now or defined schemas if available.
    return users
