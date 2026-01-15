"""
Modelo de Auditoría (Audit Log).
Registra todas las acciones críticas del sistema para respaldo legal y seguridad.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from datetime import datetime
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Puede ser Null si es un intento de login fallido o sistema
    action = Column(String, nullable=False, index=True) # Ej: "RIDE_CREATED", "BOOKING_CANCELLED"
    details = Column(JSON, nullable=True) # Detalles completos en formato JSON
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Nota: No definimos relación inversa en User para no ensuciar el modelo User 
    # con un historial infinito. Las consultas se harán directo sobre esta tabla.
