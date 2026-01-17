
import sys
import os

# Ensure backend acts as root
sys.path.append(os.getcwd())

from app.database import engine, Base
# Importar modelos para que SQLAlchemy los conozca antes de crear
from app.models.user import User
from app.models.ride import Ride
from app.models.booking import Booking
from app.models.payment import Payment

def reset_database():
    print("⚠️  ADVERTENCIA DE SEGURIDAD ⚠️")
    print("Estás a punto de BORRAR TODA LA BASE DE DATOS.")
    confirm = input("Escribe 'ELIMINAR' para confirmar: ")
    
    if confirm != "ELIMINAR":
        print("❌ Operación cancelada.")
        return

    print("🗑️  Eliminando tablas...")
    Base.metadata.drop_all(bind=engine)
    
    print("✨  Creando tablas nuevas (Schema Refactorizado)...")
    Base.metadata.create_all(bind=engine)
    
    print("✅  Base de Datos reseteada exitosamente.")

if __name__ == "__main__":
    reset_database()
