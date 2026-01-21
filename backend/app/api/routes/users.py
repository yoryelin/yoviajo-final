"""
Rutas de Gestión de Usuarios y Perfil.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.api.deps import get_current_user
from app import utils
from app.services.storage_service import StorageService

router = APIRouter(prefix="/api/users", tags=["users"])
storage_service = StorageService()


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Obtener perfil del usuario actual.
    """
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_my_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar perfil del usuario (Datos extendidos, Auto, Preferencias).
    """
    # Recorrer campos del schema y actualizar si no son None
    update_data = user_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    db.commit()
    db.refresh(current_user)
    
    # AUDIT LOG
    utils.log_audit(db, "PROFILE_UPDATED", update_data, current_user.id)
    
    return current_user


@router.post("/verify_request")
def request_verification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Solicitar verificación de identidad.
    (MVP: Simplemente cambia el estado a 'pending' y hace un log mock).
    En prod real: Subir archivos a S3 y guardar URLs.
    """
    if current_user.verification_status == 'verified':
        return {"message": "Ya estás verificado."}
        
    current_user.verification_status = 'pending'
    # Mock auto-approve for Demo purposes if needed? 
    # Or keep as pending and let Admin (Manual DB) approve?
    # Let's keep as pending to show the flow.
    
    # Wait... for the demo, the user wants to SEE the badge. 
    # Let's Mock Auto-Approve for now to satisfy the user request "Ganar el badge".
    # Or maybe a "Simulated Approval" after 2 seconds? No, simpler.
    # Let's set it to 'verified' directly for the MVP Demo experience if they upload "something".
    
    current_user.verification_status = 'verified'
    current_user.is_verified = True
    
    db.commit()
    
    return {"message": "Verificación aprobada automáticamente (Modo Demo) ✅"}


@router.post("/me/photo", response_model=UserResponse)
def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sube una foto de perfil a Cloudinary y actualiza el usuario.
    """
    if not storage_service.enabled:
        raise HTTPException(
            status_code=503, 
            detail="El servicio de almacenamiento no está configurado."
        )

    # Validar tipo de archivo (solo imagenes)
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, 
            detail="El archivo debe ser una imagen."
        )

    # Subir a Cloudinary
    url = storage_service.upload_file(file.file, file.filename)
    
    if not url:
        raise HTTPException(
            status_code=500, 
            detail="Error al subir la imagen."
        )
        
    # Actualizar DB
    current_user.profile_picture = url
    db.commit()
    db.refresh(current_user)
    
    # Audit
    utils.log_audit(db, "PROFILE_PHOTO_UPDATED", {"url": url}, current_user.id)
    
    return current_user
