
from app.database import SessionLocal
from app.models.user import User
from app.models.ride import Ride
from app.utils.auth import get_password_hash
from datetime import datetime, timedelta

db = SessionLocal()

# 1. Create/Get Verified Driver
driver_email = "verified_driver@test.com"
driver = db.query(User).filter(User.email == driver_email).first()

if not driver:
    driver = User(
        email=driver_email,
        dni="99887766",
        name="Capitán Verificado",
        hashed_password=get_password_hash("123456"),
        role="C",
        is_active=True,
        is_verified=True,             # <--- KEY
        verification_status="verified", # <--- KEY
        verification_document="https://via.placeholder.com/150",
        car_model="Tesla Model 3",
        car_plate="TES-123",
        car_color="Blanco"
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
else:
    # Ensure he is verified
    driver.is_verified = True
    driver.verification_status = "verified"
    db.commit()

# 2. Create Ride
departure = datetime.now() + timedelta(days=1, hours=2) # Tomorrow
ride = Ride(
    origin="Central Park",
    destination="Times Square",
    departure_time=departure.isoformat(),
    price=5000,
    available_seats=3,
    driver_id=driver.id,
    status="active",
    women_only=False
)

db.add(ride)
db.commit()

print(f"✅ Created Verified Ride ID: {ride.id} for Driver: {driver.name}")
