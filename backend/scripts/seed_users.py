from app.database import SessionLocal, engine, Base
from app.models.user import User
from app import auth

# Re-create tables (in case DB was deleted)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

def create_user(dni, name, role, email, plain_password):
    # Check if exists
    existing = db.query(User).filter(User.dni == dni, User.role == role).first()
    if existing:
        print(f"Skipping {name} ({role}): Already exists.")
        return

    user = User(
        dni=dni,
        name=name,
        email=email,
        hashed_password=auth.get_password_hash(plain_password),
        role=role,
        is_active=True
    )
    db.add(user)
    db.commit()
    print(f"Created {name} [{role}] - Email: {email}")

print("--- SEEDING USERS ---")

# 1. Jorge (Dual) - Two profiles, sharing DNI but different roles.
# Note: Using same email for both roles if system allows, or variations?
# User Model constraints: Unique(email, role). So same email is fine for different roles.
create_user("11111111", "Jorge Dual", "C", "dual@test.com", "12345678")
create_user("11111111", "Jorge Dual", "P", "dual@test.com", "12345678")

# 2. Maria (Conductora)
create_user("22222222", "Maria Conductora", "C", "conductor@test.com", "12345678")

# 3. Pedro (Pasajero)
create_user("33333333", "Pedro Pasajero", "P", "pasajero@test.com", "12345678")

print("--- SEEDING COMPLETE ---")
db.close()
