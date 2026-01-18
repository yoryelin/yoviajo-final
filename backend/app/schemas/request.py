"""
Schemas de Solicitudes (RideRequests).
"""
from pydantic import BaseModel
from typing import Optional


class RequestBase(BaseModel):
    origin: str
    destination: str
    date: str
    time_window_start: Optional[str] = None
    time_window_end: Optional[str] = None
    is_flexible: bool = True
    proposed_price: Optional[int] = None
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    origin_reference: Optional[str] = None
    destination_reference: Optional[str] = None


class RequestCreate(RequestBase):
    pass  # El passenger se obtiene del usuario autenticado


class RequestResponse(RequestBase):
    id: int
    passenger_id: int
    maps_url: Optional[str] = None
    matches_count: int = 0

    class Config:
        from_attributes = True

