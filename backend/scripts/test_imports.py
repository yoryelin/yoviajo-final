"""
Script de prueba para verificar que todos los imports funcionan correctamente.
Ejecutar: python test_imports.py
"""
import sys
import os

# Add parent directory to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("Verificando imports...")

try:
    print("1. Importando config...")
    from app.config import settings
    print("   ✓ Config OK")
    
    print("2. Importando database...")
    from app.database import Base, engine, get_db
    print("   ✓ Database OK")
    
    print("3. Importando auth...")
    from app.auth import verify_password, get_password_hash, create_access_token
    print("   ✓ Auth OK")
    
    print("4. Importando models...")
    from app.models import User, Ride, RideRequest
    print("   ✓ Models OK")
    
    print("5. Importando schemas...")
    from app.schemas import (
        UserCreate, UserResponse, UserLogin, Token,
        RideCreate, RideResponse,
        RequestCreate, RequestResponse
    )
    print("   ✓ Schemas OK")
    
    print("6. Importando deps...")
    from app.api.deps import get_current_user
    print("   ✓ Deps OK")
    
    print("7. Importando routes...")
    from app.api.routes import auth, rides, requests, geocode
    print("   ✓ Routes OK")
    
    print("8. Importando utils...")
    from app import utils
    print("   ✓ Utils OK")
    
    print("9. Importando main app...")
    from app.main import app
    print("   ✓ Main app OK")
    
    print("\n✅ ¡Todos los imports funcionan correctamente!")
    print(f"   Project: {settings.PROJECT_NAME}")
    print(f"   Version: {settings.VERSION}")
    print(f"   Debug: {settings.DEBUG}")
    
except ImportError as e:
    print(f"\n❌ Error de importación: {e}")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)


