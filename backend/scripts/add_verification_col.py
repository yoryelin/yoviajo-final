import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text, inspect
from app.config import settings

def add_verification_column():
    print(f"Connecting to database...")
    engine = create_engine(settings.DATABASE_URL)
    
    # Use Inspector for cross-db compatibility
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    if 'verification_document' in columns:
        print("✅ Column 'verification_document' already exists.")
    else:
        print("⚠️ Column 'verification_document' missing. Adding it now...")
        with engine.connect() as conn:
            try:
                # Add column
                alter_query = text("ALTER TABLE users ADD COLUMN verification_document VARCHAR;")
                conn.execute(alter_query)
                conn.commit()
                print("✅ Successfully added 'verification_document' column.")
            except Exception as e:
                print(f"❌ Error adding column: {e}")

if __name__ == "__main__":
    add_verification_column()
