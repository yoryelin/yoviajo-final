"""
Rutas de autenticación: registro y login.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
from app import auth
from app import utils

from app.core.logger import logger

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
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
    
    # AUDIT LOG
    ip = request.client.host if request.client else "0.0.0.0"
    utils.log_audit(db, "USER_REGISTERED", {"dni": new_user.dni, "email": new_user.email, "role": new_user.role}, new_user.id, ip)
    
    return new_user


@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    """
    Login de usuario existente. Devuelve token JWT.
    Identificación directa por DNI (Cuenta Única).
    """
    logger.info(f"Login Request for DNI={user_credentials.dni}")

    # Buscar UNICA cuenta con este DNI
    user = db.query(User).filter(User.dni == user_credentials.dni).first()

    if not user:
        # Por seguridad no deberiamos decir si existe o no, pero para UX diremos credenciales incorrectas
        raise HTTPException(status_code=401, detail="Credenciales incorrectas (DNI o Password)")

    # Verificar Password
    if not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas (DNI o Password)")

    # Login Exitoso
    access_token = auth.create_access_token(
        data={"sub": user.dni, "id": user.id} 
    )
    
    # AUDIT LOG
    ip = request.client.host if request.client else "0.0.0.0"
    utils.log_audit(db, "USER_LOGIN", {"dni": user.dni, "role": user.role}, user.id, ip)

    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user": user
    }


