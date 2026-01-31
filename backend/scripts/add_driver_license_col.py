from app.database import engine
from sqlalchemy import text

def add_column():
    print("Adding driver_license column to users table...")
    with engine.connect() as connection:
        try:
            connection.execute(text("ALTER TABLE users ADD COLUMN driver_license VARCHAR;"))
            print("Column added successfully.")
        except Exception as e:
            print(f"Error (maybe column exists): {e}")

if __name__ == "__main__":
    add_column()
