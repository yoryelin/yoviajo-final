"""
Rutas de autenticación: registro y login.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
from app import auth
from app import utils
from app.services.email_service import EmailService
from app.services.audit_service import AuditService

from app.core.logger import logger

router = APIRouter(prefix="/api", tags=["auth"])
email_service = EmailService()


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Registro de nuevo usuario.
    Requiere DNI, Email, Nombre y Password.
    AHORA: DNI y Email son únicos globales (Una cuenta por persona).
    """
    logger.info(f"Register attempt for DNI: {user.dni}, Email: {user.email}")
    
    # 1. Verificar DNI duplicado GLOBALMENTE
    if db.query(User).filter(User.dni == user.dni).first():
        logger.warning(f"Registration failed: DNI {user.dni} already exists.")
        raise HTTPException(status_code=400, detail="Ya existe una cuenta registrada con este DNI.")

    # 2. Verificar Email duplicado GLOBALMENTE
    if db.query(User).filter(User.email == user.email).first():
        logger.warning(f"Registration failed: Email {user.email} already exists.")
        raise HTTPException(status_code=400, detail="Ya existe una cuenta registrada con este Email.")

    hashed_pwd = auth.get_password_hash(user.password)
    new_user = User(
        dni=user.dni,
        email=user.email, 
        name=user.name, 
        hashed_password=hashed_pwd,
        role=user.role,
        gender=user.gender,
        phone=user.phone,
        # Extended Profile
        birth_date=user.birth_date,
        address=user.address,
        # Driver Profile
        car_model=user.car_model,
        car_plate=user.car_plate,
        car_color=user.car_color,
        prefs_smoking=user.prefs_smoking,
        prefs_pets=user.prefs_pets,
        prefs_luggage=user.prefs_luggage
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # MAIL BIENVENIDA (Background)
    if email_service.enabled:
        background_tasks.add_task(
            email_service.send_welcome_email, 
            new_user.name, 
            new_user.email, 
            new_user.role
        )
    
    # AUDIT LOG
    ip = request.client.host if request.client else "0.0.0.0"
    AuditService.log(db, "USER_REGISTERED", user_id=new_user.id, details={"dni": new_user.dni, "email": new_user.email, "role": new_user.role}, ip_address=ip)
    
    return new_user


@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    """
    Login de usuario existente. Devuelve token JWT.
    Identificación directa por DNI (Cuenta Única).
    """
    try:
        logger.info(f"Login Request for DNI={user_credentials.dni}")

        # Buscar UNICA cuenta con este DNI
        user = db.query(User).filter(User.dni == user_credentials.dni).first()

        if not user:
            logger.warning(f"Login failed: User {user_credentials.dni} not found.")
            # Por seguridad no deberiamos decir si existe o no, pero para UX diremos credenciales incorrectas
            raise HTTPException(status_code=401, detail="Credenciales incorrectas (DNI o Password)")

        if not user.is_active:
            logger.warning(f"Login failed: User {user.dni} is inactive (Pending Approval).")
            raise HTTPException(status_code=403, detail="Tu cuenta está pendiente de aprobación por un administrador.")

        # Verificar Password
        try:
            if not auth.verify_password(user_credentials.password, user.hashed_password):
                logger.warning(f"Login failed: Invalid password for {user_credentials.dni}")
                raise HTTPException(status_code=401, detail="Credenciales incorrectas (DNI o Password)")
        except ValueError as ve:
             logger.error(f"Bcrypt Error for {user_credentials.dni}: {ve}")
             raise HTTPException(status_code=500, detail="Error de seguridad interno (Hash Invalido)")

        # Login Exitoso
        access_token = auth.create_access_token(
            data={"sub": user.dni, "id": user.id} 
        )
        
        # AUDIT LOG
        ip = request.client.host if request.client else "0.0.0.0"
        AuditService.log(db, "USER_LOGIN", user_id=user.id, details={"dni": user.dni, "role": user.role}, ip_address=ip)

        logger.info(f"Login Successful for {user_credentials.dni}")
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "user": user
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CRITICAL LOGIN ERROR: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal Login Error: {str(e)}")


# SCHEMAS PARA RESET
from pydantic import BaseModel, EmailStr
from datetime import timedelta

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Inicia el proceso de recuperación. Genera token y envía email.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Por seguridad no deberíamos decir si existe o no, pero para MVP UX ayudamos.
        # Mejor: Retornar 200 siempre.
        logger.info(f"Forgot pwd request for non-existent email: {payload.email}")
        return {"message": "Si el email existe, recibirás instrucciones."}

    # Generar Token de Recuperación (JWT de corta vida)
    recovery_token = auth.create_access_token(
        data={"sub": user.dni, "purpose": "recovery"},
        expires_delta=timedelta(minutes=30)
    )
    
    # Enviar Email en Backgound
    if email_service.enabled:
        background_tasks.add_task(
            email_service.send_recovery_email, 
            user.email, 
            recovery_token
        )
    
    return {"message": "Si el email existe, recibirás instrucciones."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Restablece la contraseña usando el token.
    """
    try:
        # Validar Token
        import jwt # type: ignore
        # Reusamos la logica de auth
        payload_data = jwt.decode(payload.token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        dni: str = payload_data.get("sub")
        purpose: str = payload_data.get("purpose")
        
        if purpose != "recovery":
            raise HTTPException(status_code=400, detail="Token inválido para recuperación")
            
    except Exception:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
        
    user = db.query(User).filter(User.dni == dni).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    # Cambiar Password
    user.hashed_password = auth.get_password_hash(payload.new_password)
    db.commit()
    
    return {"message": "Contraseña actualizada correctamente"}


