"""
Modelo de Usuario.
"""
from sqlalchemy import Column, Integer, String, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String, index=True)  # Unique per role (see __table_args__)
    email = Column(String, index=True)  # Unique per role
    name = Column(String)
    hashed_password = Column(String)
    phone = Column(String, nullable=True) # WhatsApp
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)
    cancellation_count = Column(Integer, default=0)
    reputation_score = Column(Integer, default=100)

    # Trust & Safety
    gender = Column(String, nullable=True) # M, F, O
    is_verified = Column(Boolean, default=False)
    verification_status = Column(String, default="unverified") # unverified, pending, verified, rejected
    
    # Driver Profile
    car_model = Column(String, nullable=True)
    car_plate = Column(String, nullable=True)
    phone_verified = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False)

    rides_offered = relationship("Ride", back_populates="driver")
    rides_requested = relationship("RideRequest", back_populates="passenger")
    bookings = relationship("Booking", back_populates="passenger")

    __table_args__ = (
        UniqueConstraint('dni', 'role', name='uix_dni_role'),
        UniqueConstraint('email', 'role', name='uix_email_role'),
    )

