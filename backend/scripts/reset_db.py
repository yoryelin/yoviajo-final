import sys
import os
import logging

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
# Import all models to ensure they are registered in metadata
from app.models import user, ride, booking, payment, audit

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_database():
    logger.info("Starting database reset...")
    logger.info(f"Connected to: {engine.url}")
    
    confirm = input("Are you sure you want to DELETE ALL DATA? (y/n): ")
    if confirm.lower() != 'y':
        logger.info("Operation cancelled.")
        return

    logger.info("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    logger.info("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    logger.info("Database reset complete successfully.")

if __name__ == "__main__":
    # Auto-confirm for automation if argument "force" is passed
    if len(sys.argv) > 1 and sys.argv[1] == "force":
        print("Forcing reset...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("Reset complete.")
    else:
        reset_database()
