from app.database import SessionLocal
from app.models import Ride, RideRequest, User

db = SessionLocal()

user_count = db.query(User).count()
ride_count = db.query(Ride).count()
req_count = db.query(RideRequest).count()

print(f"Users: {user_count}")
print(f"Rides: {ride_count}")
print(f"Requests: {req_count}")

if ride_count > 0:
    print("WARNING: Rides table is NOT empty. Purge failed or data persists.")
    rides = db.query(Ride).all()
    for r in rides:
        print(f" - Ride: {r.origin} -> {r.destination} (User: {r.driver_id})")

db.close()
