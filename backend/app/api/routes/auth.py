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
    """
    logger.info(f"Register attempt for DNI: {user.dni}, Email: {user.email}")
    # 1. Verificar DNI duplicado para este ROL
    if db.query(User).filter(User.dni == user.dni, User.role == user.role).first():
        raise HTTPException(status_code=400, detail="Ya existe una cuenta con este DNI para el rol seleccionado.")

    # 2. Verificar Email duplicado para este ROL
    if db.query(User).filter(User.email == user.email, User.role == user.role).first():
        raise HTTPException(status_code=400, detail="Ya existe una cuenta con este Email para el rol seleccionado.")

    hashed_pwd = auth.get_password_hash(user.password)
    new_user = User(
        dni=user.dni,
        email=user.email, 
        name=user.name, 
        hashed_password=hashed_pwd,
        role=user.role,
        gender=user.gender
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
    logger.info(f"Login Request for DNI={user_credentials.dni}, Role={user_credentials.role}")
    """
    Login de usuario existente. Devuelve token JWT.
    Usa DNI y Password.
    """
    # Buscar TODAS las cuentas con este DNI
    users = db.query(User).filter(User.dni == user_credentials.dni).all()

    if not users:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas (DNI no encontrado)")

    # Si se especificó el rol, filtramos
    target_user = None
    if user_credentials.role:
        target_user = next((u for u in users if u.role == user_credentials.role), None)
        if not target_user:
             raise HTTPException(status_code=401, detail="No tienes cuenta con ese rol.")
    else:
        # Si NO se especificó rol, y hay más de uno, pedimos desambiguar
        if len(users) > 1:
            # Retornamos 300 Multiple Choices
            # Nota: FastAPI no tiene una excepción directa para devolver body custom en 3xx fácilmente con HTTPException,
            # pero podemos devolver una JSONResponse. Sin embargo, para mantener el schema,
            # forzaremos un error 300 que el frontend entienda.
            from fastapi.responses import JSONResponse
            options = [{"role": u.role, "label": "Conductor" if u.role == 'C' else "Pasajero"} for u in users]
            return JSONResponse(
                status_code=300,
                content={"detail": "Múltiples roles detectados", "roles_available": options}
            )
        else:
            target_user = users[0]

    # Verificar Password
    if not auth.verify_password(user_credentials.password, target_user.hashed_password):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    access_token = auth.create_access_token(
        data={"sub": target_user.dni, "id": target_user.id} # Mantener sub como DNI aunque ya no sea unique global
    )
    
    # AUDIT LOG
    ip = request.client.host if request.client else "0.0.0.0"
    utils.log_audit(db, "USER_LOGIN", {"dni": target_user.dni, "role": target_user.role}, target_user.id, ip)

    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user": target_user
    }


