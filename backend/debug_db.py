
from sqlalchemy import create_engine, text
from app.config import settings
import os

# Ajustar path si es necesario para imports
import sys
sys.path.append(os.getcwd())

def check_schema():
    print(f"Checking DB: {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as connection:
        # SQLite specific command
        result = connection.execute(text("PRAGMA table_info(bookings);"))
        columns = [row[1] for row in result] # row format: (cid, name, type, notnull, dflt_value, pk)
        
        print(f"Columns in 'bookings': {columns}")
        
        required = ['payment_status', 'fee_amount']
        missing = [col for col in required if col not in columns]
        
        if missing:
            print(f"❌ MISSING COLUMNS: {missing}")
            # Attempt to fix?
            # connection.execute(text("ALTER TABLE bookings ADD COLUMN payment_status VARCHAR DEFAULT 'unpaid'"))
            # connection.execute(text("ALTER TABLE bookings ADD COLUMN fee_amount FLOAT DEFAULT 5000.0"))
            # print("✅ Attempted Update")
        else:
            print("✅ All required columns present.")

if __name__ == "__main__":
    check_schema()
