"""
Modelos de Viajes (Rides) y Solicitudes (RideRequests).
"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base


class Ride(Base):
    __tablename__ = "rides"

    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String)
    destination = Column(String)
    departure_time = Column(String)
    price = Column(Integer)
    available_seats = Column(Integer)
    status = Column(String, default="active") # active, cancelled, completed

    # Monetization (Fuel Standard)
    fuel_liters_total = Column(Float, default=0.0)
    price_per_seat_liters = Column(Float, default=0.0)
    
    # Filters & Amenities
    women_only = Column(Boolean, default=False)
    allow_pets = Column(Boolean, default=False)
    allow_smoking = Column(Boolean, default=False)
    allow_luggage = Column(Boolean, default=True)   
    # Geolocalización - coordenadas opcionales
    origin_lat = Column(Float, nullable=True)
    origin_lng = Column(Float, nullable=True)
    destination_lat = Column(Float, nullable=True)
    destination_lng = Column(Float, nullable=True)
    meeting_point = Column(String, nullable=True) # Referencia texto libre

    driver_id = Column(Integer, ForeignKey("users.id"))
    driver = relationship("User", back_populates="rides_offered")
    bookings = relationship("Booking", back_populates="ride", cascade="all, delete-orphan")


class RideRequest(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String)
    destination = Column(String)
    date = Column(String)
    time_window_start = Column(String)
    time_window_end = Column(String)
    is_flexible = Column(Boolean, default=True)
    proposed_price = Column(Integer, nullable=True)
    
    # Geolocalización - coordenadas opcionales
    origin_lat = Column(Float, nullable=True)
    origin_lng = Column(Float, nullable=True)
    destination_lat = Column(Float, nullable=True)
    destination_lng = Column(Float, nullable=True)
    meeting_point = Column(String, nullable=True) # Referencia texto libre

    passenger_id = Column(Integer, ForeignKey("users.id"))
    passenger = relationship("User", back_populates="rides_requested")

