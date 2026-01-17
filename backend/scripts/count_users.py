
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()
count = db.query(User).count()
print(f"USER_COUNT: {count}")
for u in db.query(User).all():
    print(f"User: {u.dni} - {u.email} - {u.role}")
