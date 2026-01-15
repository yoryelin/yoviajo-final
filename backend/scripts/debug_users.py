from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()

print(f"Total users: {len(users)}")
for u in users:
    print(f"ID: {u.id} | DNI: {u.dni} | Role: {u.role} | Name: {u.name} | PwdHash: {u.hashed_password[:10]}...")
