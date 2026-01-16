from fastapi import APIRouter, HTTPException
from app.database import engine, Base

router = APIRouter(prefix="/api/debug", tags=["debug"])

@router.post("/reset_db")
def reset_database():
    """
    ⚠️ PELIGRO: Borra TODO y recrea las tablas.
    Usar solo para aplicar cambios de Schema en desarrollo.
    """
    try:
        # 1. Borrar todo (Drop All)
        Base.metadata.drop_all(bind=engine)
        
        # 2. Crear todo de nuevo (Create All con nuevas columnas)
        Base.metadata.create_all(bind=engine)
        
        return {"status": "success", "message": "Base de datos reseteada y esquema actualizado."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
