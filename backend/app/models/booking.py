"""
Modelo de Reservas (Bookings).
Representa cuando un pasajero reserva asientos en un viaje ofrecido por un conductor.
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class BookingStatus(str, enum.Enum):
    """Estados posibles de una reserva."""
    PENDING = "pending"       # Reserva creada, pendiente de confirmación
    CONFIRMED = "confirmed"   # Confirmada por el conductor
    CANCELLED = "cancelled"   # Cancelada (por pasajero o conductor)
    COMPLETED = "completed"   # Viaje completado


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    
    # Relaciones
    ride_id = Column(Integer, ForeignKey("rides.id"), nullable=False)
    passenger_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Datos de la reserva
    seats_booked = Column(Integer, nullable=False, default=1)  # Cantidad de asientos
    status = Column(String, default=BookingStatus.PENDING.value, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones SQLAlchemy
    ride = relationship("Ride", back_populates="bookings")
    passenger = relationship("User", back_populates="bookings")


