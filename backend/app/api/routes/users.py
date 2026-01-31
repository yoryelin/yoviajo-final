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
from app.services.image_service import ImageService

router = APIRouter(prefix="/api/users", tags=["users"])
image_service = ImageService()
from app.services.audit_service import AuditService


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
    # AUDIT LOG
    AuditService.log(db, "PROFILE_UPDATED", user_id=current_user.id, details=update_data)
    
    return current_user


@router.post("/verify")
def verify_identity(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sube un documento de identidad para iniciar el proceso de verificación (KYC).
    Estado cambia a 'pending'.
    """
    if current_user.verification_status == 'verified':
        raise HTTPException(status_code=400, detail="Tu cuenta ya está verificada.")
    
    if current_user.verification_status == 'pending':
        raise HTTPException(status_code=400, detail="Tu verificación ya está en revisión.")

    # 1. Validar Imagen
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen (JPG/PNG).")

    # 2. Subir a Cloudinary
    if not image_service.enabled:
        raise HTTPException(status_code=503, detail="Servicio de carga no disponible.")

    url = image_service.upload_image(file.file, folder="yoviajo/kyc")
    
    if not url:
        raise HTTPException(status_code=500, detail="Fallo al subir el documento.")

    # 3. Actualizar Usuario
    current_user.verification_document = url
    current_user.verification_status = 'pending'
    
    db.commit()
    db.refresh(current_user)
    
    # 4. Audit Log
    AuditService.log(db, "VERIFICATION_REQUESTED", user_id=current_user.id, details={"doc_url": url})
    
    return {"message": "Documento subido exitosamente. Un administrador revisará tu solicitud."}


@router.post("/me/photo", response_model=UserResponse)
def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sube una foto de perfil a Cloudinary y actualiza el usuario.
    """
    if not image_service.enabled:
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
    url = image_service.upload_image(file.file, folder="yoviajo/avatars")
    
    if not url:
        raise HTTPException(
            status_code=500, 
            detail="Error al subir la imagen a la nube."
        )
        
    # Actualizar DB
    current_user.profile_picture = url
    db.commit()
    db.refresh(current_user)
    
    
    # Audit
    AuditService.log(db, "PROFILE_PHOTO_UPDATED", user_id=current_user.id, details={"url": url})
    
    return current_user


@router.post("/me/license", response_model=UserResponse)
def upload_driver_license(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sube la Licencia de Conducir a Cloudinary y actualiza el usuario.
    """
    if not image_service.enabled:
        raise HTTPException(status_code=503, detail="Servicio de carga no disponible.")

    # Validar tipo
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen.")

    # Subir a Cloudinary (Carpeta KYC o Driver)
    url = image_service.upload_image(file.file, folder="yoviajo/licenses")
    
    if not url:
        raise HTTPException(status_code=500, detail="Error al subir la licencia.")
        
    # Actualizar DB
    current_user.driver_license = url
    db.commit()
    db.refresh(current_user)
    
    # Audit
    AuditService.log(db, "LICENSE_UPLOADED", user_id=current_user.id, details={"url": url})
    
    return current_user
