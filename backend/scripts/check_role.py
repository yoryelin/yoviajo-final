from app.database import SessionLocal
from app.models.user import User
from sqlalchemy import func

def check_user_role():
    db = SessionLocal()
    try:
        # Search for Juan Pablo (case insensitive)
        user = db.query(User).filter(func.lower(User.name).contains("juan pablo")).first()
        if user:
            print(f"User Found: {user.name} (ID: {user.id})")
            print(f"Role: '{user.role}'")
            print(f"Is Verified: {user.is_verified}")
            print(f"Driver License: {user.driver_license}")
        else:
            print("User 'juan pablo' not found.")
            
            # List all users just in case
            users = db.query(User).all()
            print("\nAll Users:")
            for u in users:
                print(f"- {u.name}: {u.role}")

    finally:
        db.close()

if __name__ == "__main__":
    check_user_role()
