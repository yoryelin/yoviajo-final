from app.utils.matching import haversine_distance, find_matches_for_ride
from datetime import datetime
from unittest.mock import MagicMock

# Mock Objects to simulate DB results
class MockRequest:
    def __init__(self, id, origin_lat, origin_lng, dest_lat, dest_lng, date, start, end):
        self.id = id
        self.origin_lat = origin_lat
        self.origin_lng = origin_lng
        self.destination_lat = dest_lat
        self.destination_lng = dest_lng
        self.date = date
        self.time_window_start = start
        self.time_window_end = end

class MockRide:
    def __init__(self, origin_lat, origin_lng, dest_lat, dest_lng, dt):
        self.origin_lat = origin_lat
        self.origin_lng = origin_lng
        self.destination_lat = dest_lat
        self.destination_lng = dest_lng
        self.departure_time = dt

# Test Data
# Cordoba Center
CBA_LAT, CBA_LNG = -31.4201, -64.1888
# Carlos Paz (approx 35km away) - Should NOT match if radius is 20km
VCP_LAT, VCP_LNG = -31.4241, -64.4978
# Alta Gracia (approx 35km away)
AG_LAT, AG_LNG = -31.6529, -64.4283
# Points near Cordoba (< 5km)
NEAR_CBA_LAT, NEAR_CBA_LNG = -31.4300, -64.1900 

print(f"Distance CBA -> VCP: {haversine_distance(CBA_LAT, CBA_LNG, VCP_LAT, VCP_LNG):.2f} km")
print(f"Distance CBA -> Near CBA: {haversine_distance(CBA_LAT, CBA_LNG, NEAR_CBA_LAT, NEAR_CBA_LNG):.2f} km")

# --- Test Matching Logic ---
ride = MockRide(CBA_LAT, CBA_LNG, VCP_LAT, VCP_LNG, "2023-10-27T10:00") # Ride Cordoba -> Carlos Paz

# Request 1: Perfect Match (Same locs, same time)
req1 = MockRequest(1, CBA_LAT, CBA_LNG, VCP_LAT, VCP_LNG, "2023-10-27", "09:00", "11:00")

# Request 2: Distant Origin (Alta Gracia -> Carlos Paz) - Should Fail Distance
req2 = MockRequest(2, AG_LAT, AG_LNG, VCP_LAT, VCP_LNG, "2023-10-27", "09:00", "11:00")

# Request 3: Wrong Time (Yesterday) - Should Fail Time
req3 = MockRequest(3, CBA_LAT, CBA_LNG, VCP_LAT, VCP_LNG, "2023-10-26", "09:00", "11:00")

# Request 4: Near Origin (within 20km) - Should Match
req4 = MockRequest(4, NEAR_CBA_LAT, NEAR_CBA_LNG, VCP_LAT, VCP_LNG, "2023-10-27", "09:00", "11:00")

# Mock DB
mock_db = MagicMock()
mock_db.query.return_value.all.return_value = [req1, req2, req3, req4]

# Run Matcher
print("\n--- Running Matcher ---")
matches = find_matches_for_ride(ride, mock_db, radius_km=20)
print(f"Found {len(matches)} matches (Expected 2: req1 and req4)")
for m in matches:
    print(f" - Matched Request ID: {m.id}")
