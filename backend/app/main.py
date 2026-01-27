"""
Aplicación principal FastAPI - YoViajo!
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.models import User, Ride, RideRequest
from app.models.audit import AuditLog
from app.api.routes import auth, rides, requests, geocode, bookings, reports, users

# Configurar Logging
from app.core.logger import setup_logging
setup_logging()

import logging
logger = logging.getLogger("yoviajo_api")
logger.info("🚀 YoViajo API Starting up...")

# Crear tablas en la base de datos
# Crear tablas en la base de datos
try:
    logger.info("🔧 Attempting to create tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Tables created (or already existed).")
    
    # Verify User table existence directly
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    logger.info(f"📊 Current Tables in DB: {tables}")
    
    if "users" not in tables:
        logger.error("❌ CRITICAL: 'users' table is MISSING after create_all!")
    else:
        logger.info("✅ 'users' table exists.")
        
except Exception as e:
    logger.error(f"❌ Error creating tables: {e}")
    # Don't exit, let migrations try to run, but log heavily.

# Ejecutar Migraciones Manuales (Columnas faltantes)
from app.db_migration import run_migrations
run_migrations()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)




# Configuración CORS
# Configuración CORS
origins = [
    "http://localhost:5173",    # Local Frontend
    "http://127.0.0.1:5173",    # Local Frontend IP
    "http://localhost:4173",    # Local Preview
    "https://yoviajo.com.ar",       # Prod Domain
    "https://www.yoviajo.com.ar",   # Prod WWW
    "https://yoviajo-frontend.onrender.com" # Render Fallback
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(rides.router)
app.include_router(requests.router)
app.include_router(bookings.router)
app.include_router(reports.router)
app.include_router(geocode.router)

from app.api.routes import matches
app.include_router(matches.router)

from app.api.routes import payment
app.include_router(payment.router)

from app.api.routes import debug
app.include_router(debug.router)

from app.api.routes import admin
app.include_router(admin.router)


@app.get("/")
def read_root():
    """
    Endpoint raíz.
    """
    return {
        "message": "YoViajo API funcionando 🚀",
        "version": settings.VERSION,
        "docs": "/docs"
    }





