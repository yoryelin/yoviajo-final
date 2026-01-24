
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


@router.get("/cloudinary_check")
def check_cloudinary_config():
    """
    Debug endpoint to check Cloudinary environment variables directly.
    """
    import os
    from app.config import settings
    from app.services.image_service import ImageService
    
    svc = ImageService()
    
    return {
        "service_enabled": svc.enabled,
        "config_values": {
            "CLOUDINARY_URL (Settings)": "PRESENT" if settings.CLOUDINARY_URL else "MISSING",
            "CLOUDINARY_URL (Env)": "PRESENT" if os.environ.get("CLOUDINARY_URL") else "MISSING",
            "CLOUD_NAME (Settings)":  settings.CLOUDINARY_CLOUD_NAME or "MISSING",
            "CLOUD_NAME (Env)": os.environ.get("CLOUDINARY_CLOUD_NAME") or "MISSING",
            "API_KEY (Settings)": "PRESENT" if settings.CLOUDINARY_API_KEY else "MISSING",
            "API_KEY (Env)": "PRESENT" if os.environ.get("CLOUDINARY_API_KEY") else "MISSING",
            "API_SECRET (Settings)": "PRESENT" if settings.CLOUDINARY_API_SECRET else "MISSING",
            "API_SECRET (Env)": "PRESENT" if os.environ.get("CLOUDINARY_API_SECRET") else "MISSING",
        }
    }
