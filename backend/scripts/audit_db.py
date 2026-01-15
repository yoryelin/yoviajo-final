import sys
import os

# Add parent directory to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.user import User
from app.models.ride import Ride
from app.models.booking import Booking

def audit():
    db = SessionLocal()
    print("🔍 Auditing Database Integrity...")
    
    try:
        # Check 1: Users
        user_count = db.query(User).count()
        print(f"   Users found: {user_count}")

        # Check 2: Orphan Rides
        users_ids = [u.id for u in db.query(User.id).all()]
        if users_ids:
            orphan_rides = db.query(Ride).filter(~Ride.driver_id.in_(users_ids)).all()
            if orphan_rides:
                print(f"❌ Found {len(orphan_rides)} orphan rides (invalid driver_id)")
            else:
                print("✅ No orphan rides found.")
        else:
            print("⚠️ No users found, assuming empty DB.")

        # Check 3: Orphan Bookings
        rides_ids = [r.id for r in db.query(Ride.id).all()]
        if rides_ids:
            orphan_bookings_ride = db.query(Booking).filter(~Booking.ride_id.in_(rides_ids)).all()
            if orphan_bookings_ride:
                print(f"❌ Found {len(orphan_bookings_ride)} bookings with invalid ride_id")
            else:
                print("✅ No orphan bookings (ride) found.")
        
        if users_ids:
            orphan_bookings_user = db.query(Booking).filter(~Booking.passenger_id.in_(users_ids)).all()
            if orphan_bookings_user:
                print(f"❌ Found {len(orphan_bookings_user)} bookings with invalid passenger_id")
            else:
                print("✅ No orphan bookings (passenger) found.")

    except Exception as e:
        print(f"❌ Error during audit: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    audit()
