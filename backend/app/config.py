"""
Configuración de la aplicación usando variables de entorno.
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Base
    PROJECT_NAME: str = "YoViajo API"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./yoviajo.db")
    
    # Security
    # WARNING: This default is for dev/demo only. In prod, override with env var.
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback_secret_key_for_demo_only_12345") 
    
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080 # 7 días
    
    # CORS
    # En producción idealmente se usa una lista estricta, pero para este MVP en Render
    # permitiremos todos o los definidos en env.
    # CORS
    # En producción idealmente se usa una lista estricta, pero para este MVP en Render
    # permitiremos todos o los definidos en env.
    CORS_ORIGINS: list = ["*"]

    # Fuel Standard (Monetization)
    FUEL_PRICE_ARS: float = 1750.0 
    AVG_CONSUMPTION_KM_L: int = 10

    # MercadoPago
    MP_ACCESS_TOKEN: str = os.getenv("MP_ACCESS_TOKEN", "TEST-...")

    # Emails (Resend)
    RESEND_API_KEY: str | None = os.getenv("RESEND_API_KEY")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "onboarding@resend.dev")
    
    # Cloudinary
    CLOUDINARY_URL: str | None = os.getenv("CLOUDINARY_URL")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Validar settings al importar
try:
    settings = Settings()
except ValueError as e:
    print("❌ CRITICAL CONFIGURATION ERROR: Missing required environment variables.")
    print(f"Details: {e}")
    print("💡 Please check your .env file or environment variables.")
    # Exit immediately if security config is invalid
    import sys
    sys.exit(1)


