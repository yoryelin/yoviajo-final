"""
Schemas de Viajes (Rides).
"""
from pydantic import BaseModel
from typing import Optional


class RideBase(BaseModel):
    origin: str
    destination: str
    departure_time: str
    price: float
    available_seats: int
    
    # Amenities
    women_only: bool = False
    allow_pets: bool = False
    allow_smoking: bool = False
    allow_luggage: bool = True
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None


class RideCreate(RideBase):
    pass  # El driver se obtiene del usuario autenticado


class RideResponse(RideBase):
    id: int
    driver_id: int
    maps_url: Optional[str] = None
    status: str
    bookings_count: int = 0
    matches_count: int = 0 # Matches with active requests

    class Config:
        from_attributes = True

