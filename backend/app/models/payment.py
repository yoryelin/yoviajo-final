"""
Modelo de Pagos (Payment).
Registra las transacciones de AstroPay u otros medios.
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, unique=True)
    
    # AstroPay Data
    external_id = Column(String, index=True) # ID de la orden en AstroPay
    payment_url = Column(String) # Link de pago
    status = Column(String, default="pending") # pending, approved, rejected
    
    amount = Column(Float)
    currency = Column(String, default="ARS")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    booking = relationship("Booking", back_populates="payment")

# Add backref to Booking model lazily or just handle it here?
# Ideally Booking should know about its payment.
# In booking.py we would add: payment = relationship("Payment", uselist=False, back_populates="booking")
