import sys
import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def inspect_db():
    # Use the passed env var or fallback (though env var is better)
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("No DATABASE_URL found.")
        return

    print(f"Connecting to: {database_url.split('@')[1] if '@' in database_url else 'LOCAL'}...")
    engine = create_engine(database_url)
    inspector = inspect(engine)

    print("\n--- TABLE: users ---")
    if inspector.has_table("users"):
        for col in inspector.get_columns("users"):
            print(f"- {col['name']} ({col['type']})")
    else:
        print("Table 'users' does not exist.")

    print("\n--- TABLE: rides ---")
    if inspector.has_table("rides"):
        for col in inspector.get_columns("rides"):
            print(f"- {col['name']} ({col['type']})")
    else:
        print("Table 'rides' does not exist.")
    
    print("\n--- TABLE: requests ---")
    if inspector.has_table("requests"):
        for col in inspector.get_columns("requests"):
            print(f"- {col['name']} ({col['type']})")
    else:
        print("Table 'requests' does not exist.")

if __name__ == "__main__":
    inspect_db()
