
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db, engine, Base
from app.core.logger import logger
from app.config import settings
import os

router = APIRouter(prefix="/api/debug", tags=["debug"])

@router.post("/reset-database-force")
def reset_database_force(secret_key: str, db: Session = Depends(get_db)):
    """
    ENDPOINT PELIGROSO: Borra y recrea toda la base de datos.
    Solo funciona si se provee la SECRET_KEY correcta.
    """
    # Simple protección rudimentaria para este caso de emergencia
    # En producción usamos la env var SECRET_KEY
    if secret_key != settings.SECRET_KEY:
        logger.warning("Intento fallido de reset DB: Clave incorrecta")
        raise HTTPException(status_code=403, detail="Acceso denegado")
        
    try:
        logger.warning("⚠️ INICIANDO RESET DE BASE DE DATOS REMOTA ⚠️")
        
        # Cerrar sesiones (SQLAlchemy lo maneja pool)
        # Drop all tables
        Base.metadata.drop_all(bind=engine)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        logger.info("✅ Database reset completed successfully.")
        return {"message": "Database reset successfully. Clean slate active."}
        
    except Exception as e:
        logger.error(f"Error resetting database: {e}")
        raise HTTPException(status_code=500, detail=str(e))
