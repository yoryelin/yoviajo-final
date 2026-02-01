"""
Rutas de geocoding (conversión de direcciones a coordenadas).
"""
from fastapi import APIRouter, HTTPException
import requests

router = APIRouter(prefix="/api/geocode", tags=["geocoding"])


@router.get("/geocode")
def geocode_address(address: str):
    """
    Convierte una dirección en coordenadas (lat/lng).
    Usa OpenStreetMap Nominatim (gratuito, sin API key).
    """
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": address,
            "format": "json",
            "limit": 1,
            "addressdetails": 1
        }
        headers = {
            "User-Agent": "YoViajo-App/1.0"
        }
        response = requests.get(url, params=params, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                result = data[0]
                return {
                    "address": address,
                    "lat": float(result.get("lat", 0)),
                    "lng": float(result.get("lon", 0)),
                    "display_name": result.get("display_name", address)
                }
            else:
                 raise HTTPException(status_code=404, detail="No se encontró la dirección")
        else:
             raise HTTPException(status_code=502, detail="Error al consultar el servicio de geocoding")
    except HTTPException:
        raise
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))



from app import utils

@router.get("/autocomplete")
def autocomplete_city(q: str):
    """
    Busca ciudades en Argentina para autocompletado.
    Retorna una lista simplificada para el frontend.
    """
    if len(q) < 3:
        return []
    
    results = utils.search_nominatim_cities(q)
    formatted_results = []
    
    for r in results:
        # Simplificar el nombre (quitar códigos postales si se puede, o dejar display_name)
        # Nominatim a veces devuelve muchas cosas, tomamos display_name por simplicidad
        formatted_results.append({
            "label": r.get('display_name'),
            "value": r.get('display_name'),
            "lat": float(r.get('lat')),
            "lng": float(r.get('lon'))
        })
        
    return formatted_results

@router.get("/reverse")
def reverse_geocode(lat: float, lng: float):
    """
    Obtiene la dirección a partir de coordenadas (lat, lng).
    """
    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            "lat": lat,
            "lon": lng,
            "format": "json",
            "addressdetails": 1
        }
        headers = { "User-Agent": "YoViajo-App/1.0" }
        
        response = requests.get(url, params=params, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return {
                "display_name": data.get("display_name", "Ubicación seleccionada"),
                "address": data.get("address", {}),
                "lat": lat,
                "lng": lng
            }
        else:
            raise HTTPException(status_code=502, detail="Error en servicio de geocoding")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
