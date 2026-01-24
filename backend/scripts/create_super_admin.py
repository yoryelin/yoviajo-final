import sys
import os

# Asegurar que el directorio raíz 'backend' esté en el path para los imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User

def promote_to_admin():
    print("--- 👑 Creador de Super Admin - YoViajo! ---")
    print("Este script otorga permisos de 'admin' a un usuario existente.")
    print("")
    
    email = input("👉 Ingresa el email del usuario: ").strip()
    
    if not email:
        print("❌ Error: Debes ingresar un email.")
        return

    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ Error: No se encontró ningún usuario con el email '{email}'.")
            return

        if user.role == "admin":
            print(f"ℹ️  El usuario {user.name} ({email}) YA es administrador.")
            return

        print(f"✅ Usuario encontrado: {user.name}")
        confirm = input("¿Estás seguro de hacerlo ADMIN? (s/n): ").lower()
        
        if confirm == 's':
            user.role = "admin"
            db.commit()
            print(f"🎉 ¡Éxito! {user.name} ahora es SUPER ADMIN.")
        else:
            print("🚫 Operación cancelada.")
            
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    promote_to_admin()
