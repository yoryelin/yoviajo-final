"""
Utilidades para geolocalización, generación de enlaces de Maps y Auditoría.
"""
from typing import Optional
import requests
from datetime import datetime, timedelta

def search_nominatim_cities(query: str, limit: int = 5):
    """
    Busca ciudades en Argentina usando OpenStreetMap Nominatim.
    """
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": query,
            "countrycodes": "ar",  # Restringir a Argentina
            "format": "json",
            "limit": limit,
            "addressdetails": 1,
            # removed featuretype for broader search initially, can refine if needed
        }
        # Es importante usar un User-Agent válido para Nominatim
        headers = {
            "User-Agent": "YoViajo-App/1.0"
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=5)
        
        if response.status_code == 200:
            return response.json()
        return []
    except Exception as e:
        print(f"Error consulting Nominatim: {e}")
        return []

def generate_google_maps_url(
    origin: str, 
    destination: str, 
    origin_lat: Optional[float] = None, 
    origin_lng: Optional[float] = None, 
    dest_lat: Optional[float] = None, 
    dest_lng: Optional[float] = None
) -> str:
    """
    Genera un enlace de Google Maps para navegación desde origen a destino.
    
    Si hay coordenadas, las usa. Si no, usa las direcciones en texto.
    """
    if not origin or not destination:
        return None

    if origin_lat and origin_lng and dest_lat and dest_lng:
        # Usar coordenadas si están disponibles (más preciso)
        return f"https://www.google.com/maps/dir/?api=1&origin={origin_lat},{origin_lng}&destination={dest_lat},{dest_lng}&travelmode=driving"
    else:
        # Usar direcciones en texto
        origin_encoded = origin.replace(" ", "+")
        dest_encoded = destination.replace(" ", "+")
        return f"https://www.google.com/maps/dir/?api=1&origin={origin_encoded}&destination={dest_encoded}&travelmode=driving"


def generate_maps_search_url(location: str, lat: Optional[float] = None, lng: Optional[float] = None) -> str:
    """
    Genera un enlace para buscar una ubicación en Google Maps.
    """
    if lat and lng:
        return f"https://www.google.com/maps/search/?api=1&query={lat},{lng}"
    else:
        location_encoded = location.replace(" ", "+")
        return f"https://www.google.com/maps/search/?api=1&query={location_encoded}"


def log_audit(db, action: str, details: dict = None, user_id: int = None, ip_address: str = None):
    """
    Registra una acción en el log de auditoría.
    """
    from app.models.audit import AuditLog
    try:
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            details=details or {},
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        print(f"❌ Error escribiendo AuditLog: {e}")

def is_within_penalty_window(departure_time: datetime, hours: int = 6) -> bool:
    """
    Verifica si el tiempo actual está dentro de la ventana de penalización
    (menos de 'hours' horas antes de la salida).
    """
    if not departure_time.tzinfo:
        # Asumir local/server time si no hay timezone, idealmente manejar UTC siempre
        now = datetime.now()
    else:
        now = datetime.now(departure_time.tzinfo)
        
    # Calcular tiempo restante
    time_remaining = departure_time - now
    
    # Si el viaje ya pasó, técnicamente es penalizable cancelar (o imposible)
    if time_remaining.total_seconds() < 0:
        return True
        
    return time_remaining <= timedelta(hours=hours)


def apply_reputation_penalty(user, points: int) -> int:
    """
    Aplica una penalización a la reputación del usuario.
    Retorna el nuevo puntaje.
    """
    user.cancellation_count += 1
    user.reputation_score = max(0, user.reputation_score - points)
    return user.reputation_score
