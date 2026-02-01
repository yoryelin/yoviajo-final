from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.booking import Booking
from app.models.review import Review
from app.models.ride import Ride
from app.core.security import get_current_user

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"]
)

# --- Schemas ---
class ReviewCreate(BaseModel):
    booking_id: int
    rating: int # 1-5
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    reviewer_name: str
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

# --- Endpoints ---

@router.post("/", response_model=ReviewResponse)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a review for a completed booking.
    Automatically updates the reviewee's reputation score.
    """
    
    # 1. Validate Rating Range
    if not (1 <= review_in.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # 2. Fetch Booking
    booking = db.query(Booking).filter(Booking.id == review_in.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # 3. Validation: User must be part of the booking
    # Determine roles
    is_passenger = booking.passenger_id == current_user.id
    # We need to fetch the ride to check driver
    ride = db.query(Ride).filter(Ride.id == booking.ride_id).first()
    if not ride:
         raise HTTPException(status_code=404, detail="Ride associated with booking not found")
         
    is_driver = ride.driver_id == current_user.id

    if not (is_passenger or is_driver):
        raise HTTPException(status_code=403, detail="You are not a participant in this booking")

    # 4. Determine Target (Reviewee)
    if is_passenger:
        reviewee_id = ride.driver_id
    else:
        # User is driver, reviewee is passenger
        reviewee_id = booking.passenger_id

    # 5. Check duplicate review
    existing_review = db.query(Review).filter(
        Review.booking_id == booking.id,
        Review.reviewer_id == current_user.id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this trip")

    # 6. Create Review
    new_review = Review(
        booking_id=booking.id,
        reviewer_id=current_user.id,
        reviewee_id=reviewee_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    # 7. Recalculate Reputation Score (Simple Average * 20)
    # Get all reviews for reviewee
    stats = db.query(func.avg(Review.rating)).filter(Review.reviewee_id == reviewee_id).scalar()
    
    if stats:
        # stats is float 1.0 - 5.0
        # Convert to 0-100 scale: (Avg / 5) * 100  OR  Avg * 20
        new_score = int(stats * 20)
        
        reviewee = db.query(User).filter(User.id == reviewee_id).first()
        if reviewee:
            reviewee.reputation_score = new_score
            db.commit()

    return {
        "id": new_review.id,
        "reviewer_name": current_user.name,
        "rating": new_review.rating,
        "comment": new_review.comment,
        "created_at": new_review.created_at
    }

@router.get("/user/{user_id}", response_model=List[ReviewResponse])
def get_user_reviews(
    user_id: int, 
    skip: int = 0, 
    limit: int = 10, 
    db: Session = Depends(get_db)
):
    """
    Get all reviews received by a specific user.
    """
    reviews = db.query(Review).options(joinedload(Review.reviewer)).filter(
        Review.reviewee_id == user_id
    ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()

    return [
        {
            "id": r.id,
            "reviewer_name": r.reviewer.name if r.reviewer else "Usuario",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at
        }
        for r in reviews
    ]
