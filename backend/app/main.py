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

# ...

# Incluir routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(rides.router)
app.include_router(requests.router)
app.include_router(bookings.router)
app.include_router(bookings.router)
app.include_router(reports.router)
app.include_router(geocode.router)

from app.api.routes import payment
app.include_router(payment.router)

from app.api.routes import debug
app.include_router(debug.router)


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

