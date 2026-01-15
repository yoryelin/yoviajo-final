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
    # CRITICAL: No default value here. Must be loaded from env.
    SECRET_KEY: str 
    
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080 # 7 días
    
    # CORS
    # En producción idealmente se usa una lista estricta, pero para este MVP en Render
    # permitiremos todos o los definidos en env.
    CORS_ORIGINS: list = ["*"]
    
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


