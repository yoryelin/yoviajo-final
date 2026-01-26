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

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Ejecutar Migraciones Manuales (Columnas faltantes)
from app.db_migration import run_migrations
run_migrations()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)

# Configurar Logging
from app.core.logger import setup_logging
setup_logging()

import logging
logger = logging.getLogger("yoviajo_api")
logger.info("🚀 YoViajo API Starting up...")


# Configuración CORS
# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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





