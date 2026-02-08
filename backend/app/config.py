"""
Configuración de la aplicación usando variables de entorno.
"""
import os
from pydantic_settings import BaseSettings

# --- CRITICAL FIX: Sanitize Environment for Cloudinary ---
# The cloudinary library crashes on import if CLOUDINARY_URL is present but malformed.
# We check it here (very early) and remove it if it's broken, so the app doesn't crash.
# The app will fallback to individual keys (CLOUD_NAME, API_KEY, SECRET) later.
raw_cloudinary_url = os.environ.get("CLOUDINARY_URL", "")
if raw_cloudinary_url and not raw_cloudinary_url.strip().startswith("cloudinary://"):
    print(f"⚠️ WARNING: Malformed CLOUDINARY_URL detected: '{raw_cloudinary_url[:10]}...'. Removing it to prevent crash.")
    del os.environ["CLOUDINARY_URL"]
# ---------------------------------------------------------


class Settings(BaseSettings):
    # Base
    PROJECT_NAME: str = "YoViajo API"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Database
    DATABASE_URL: str = "sqlite:///./yoviajo.db"
    
    # Security
    SECRET_KEY: str = "fallback_secret_key_for_demo_only_12345" 
    
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080 # 7 días
    
    # CORS
    # En producción idealmente se usa una lista estricta, pero para este MVP en Render
    # permitiremos todos o los definidos en env.
    # CORS
    # En producción idealmente se usa una lista estricta, pero para este MVP en Render
    # permitiremos todos o los definidos en env.
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "https://yoviajo-frontend.onrender.com",
        "https://yoviajo.com.ar",
        "https://www.yoviajo.com.ar"
    ]

    # Fuel Standard (Monetization)
    FUEL_PRICE_ARS: float = 1750.0 
    AVG_CONSUMPTION_KM_L: int = 10

    # MercadoPago
    MP_ACCESS_TOKEN: str = "TEST-PLACEHOLDER-POR-AHORA"

    # Emails (Resend)
    RESEND_API_KEY: str | None = None
    FROM_EMAIL: str = "onboarding@resend.dev"
    
    # Cloudinary
    CLOUDINARY_URL: str | None = None
    CLOUDINARY_CLOUD_NAME: str | None = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: str | None = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: str | None = os.getenv("CLOUDINARY_API_SECRET")
    
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


