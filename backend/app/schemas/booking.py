"""
Schemas de Reservas (Bookings).
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class BookingBase(BaseModel):
    ride_id: int
    seats_booked: int = Field(default=1, ge=1, le=10, description="Cantidad de asientos a reservar")
    
    @validator('seats_booked')
    def validate_seats(cls, v):
        if v < 1:
            raise ValueError('Debe reservar al menos 1 asiento')
        if v > 10:
            raise ValueError('No se pueden reservar más de 10 asientos')
        return v


class BookingCreate(BookingBase):
    pass  # El passenger_id se obtiene del usuario autenticado


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    seats_booked: Optional[int] = Field(None, ge=1, le=10)


class BookingResponse(BookingBase):
    id: int
    passenger_id: int
    status: str
    payment_status: str
    fee_amount: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Información del viaje (desde la relación)
    ride_origin: Optional[str] = None
    ride_destination: Optional[str] = None
    ride_departure_time: Optional[str] = None
    ride_price: Optional[int] = None
    driver_name: Optional[str] = None
    
    # Geolocalización del viaje
    maps_url: Optional[str] = None
    
    # Información del pasajero
    passenger_name: Optional[str] = None
    passenger_phone: Optional[str] = None # WhatsApp

    class Config:
        from_attributes = True


