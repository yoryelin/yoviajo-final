"""
Modelo de Usuario.
"""
from sqlalchemy import Column, Integer, String, Boolean, UniqueConstraint, Date
from sqlalchemy.orm import relationship
from datetime import datetime     
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String, unique=True, index=True) 
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    phone = Column(String, nullable=True) # WhatsApp
    profile_picture = Column(String, nullable=True) # URL Cloudinary
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)
    cancellation_count = Column(Integer, default=0)
    reputation_score = Column(Integer, default=100)

    # Trust & Safety
    gender = Column(String, nullable=True) # M, F, O
    is_verified = Column(Boolean, default=False)
    verification_status = Column(String, default="unverified") # unverified, pending, verified, rejected
    verification_document = Column(String, nullable=True) # URL of DNI/License
    
    # Driver Profile
    car_model = Column(String, nullable=True)
    car_plate = Column(String, nullable=True)
    car_color = Column(String, nullable=True) # Added color
    phone_verified = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False)
    
    # Extended Profile
    birth_date = Column(Date, nullable=True)
    address = Column(String, nullable=True)
    
    # Driver Preferences (Defaults)
    prefs_smoking = Column(Boolean, default=False)
    prefs_pets = Column(Boolean, default=False)
    prefs_luggage = Column(Boolean, default=True)

    rides_offered = relationship("Ride", back_populates="driver")
    rides_requested = relationship("RideRequest", back_populates="passenger")
    bookings = relationship("Booking", back_populates="passenger")

    @property
    def age(self):
        if not self.birth_date:
            return None
        today = datetime.now().date()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))

