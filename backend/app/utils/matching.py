from math import radians, cos, sin, asin, sqrt
from sqlalchemy.orm import Session
from app.models.ride import Ride, RideRequest
from app.models.user import User
from datetime import datetime, timedelta

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    if None in [lat1, lon1, lat2, lon2]:
        return float('inf')

    # convert decimal degrees to radians 
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles
    return c * r

def find_matches_for_ride(ride_data: Ride, db: Session, radius_km=20):
    """
    Find PASSENGER REQUESTS that match a DRIVER OFFER (Ride).
    """
    candidates = []
    
    # 1. Filter by approximate time (same day)
    # This is a naive filter, ideally we parse datetimes properly.
    # ride.departure_timeStr = "YYYY-MM-DDTHH:MM"
    ride_dt = datetime.fromisoformat(ride_data.departure_time)
    
    # Get all active requests
    requests = db.query(RideRequest).all() # OPTIMIZE: Filter by date in SQL if possible
    
    for req in requests:
        # Check Date Match
        # req.date = "YYYY-MM-DD", req.time_window_start="HH:MM"
        try:
             req_dt_start = datetime.fromisoformat(f"{req.date}T{req.time_window_start}")
             req_dt_end = datetime.fromisoformat(f"{req.date}T{req.time_window_end}")
        except ValueError:
            continue
            
        # Check if Ride Departure is within Request Window (or close enough)
        # Tolerance: +/- 1 hour outside preferred window
        tolerance = timedelta(hours=1)
        if not (req_dt_start - tolerance <= ride_dt <= req_dt_end + tolerance):
            continue
            
        # Check Location Match (Origin AND Destination)
        dist_origin = haversine_distance(ride_data.origin_lat, ride_data.origin_lng, req.origin_lat, req.origin_lng)
        dist_dest = haversine_distance(ride_data.destination_lat, ride_data.destination_lng, req.destination_lat, req.destination_lng)
        
        if dist_origin <= radius_km and dist_dest <= radius_km:
            candidates.append(req)
            
    return candidates

def find_matches_for_request(request_data: RideRequest, db: Session, radius_km=20):
    """
    Find DRIVER OFFERS (Rides) that match a PASSENGER REQUEST.
    """
    candidates = []
    
    try:
        req_dt_start = datetime.fromisoformat(f"{request_data.date}T{request_data.time_window_start}")
        req_dt_end = datetime.fromisoformat(f"{request_data.date}T{request_data.time_window_end}")
    except ValueError:
        return []

    # Get all active rides
    rides = db.query(Ride).filter(Ride.status == 'active').all()
    
    for ride in rides:
        # Check Time
        try:
            ride_dt = datetime.fromisoformat(ride.departure_time)
        except ValueError:
            continue
            
        tolerance = timedelta(hours=1)
        if not (req_dt_start - tolerance <= ride_dt <= req_dt_end + tolerance):
            continue

        # Check Location
        dist_origin = haversine_distance(request_data.origin_lat, request_data.origin_lng, ride.origin_lat, ride.origin_lng)
        dist_dest = haversine_distance(request_data.destination_lat, request_data.destination_lng, ride.destination_lat, ride.destination_lng)
        
        if dist_origin <= radius_km and dist_dest <= radius_km:
            candidates.append(ride)
            
    return candidates
