# 🌍 Geolocalización en YoViajo!

## Funcionalidades Implementadas

### 1. **Campos de Coordenadas en Modelos**
- `Ride` y `RideRequest` ahora incluyen campos opcionales:
  - `origin_lat`, `origin_lng` (coordenadas del origen)
  - `destination_lat`, `destination_lng` (coordenadas del destino)

### 2. **Enlaces Automáticos a Google Maps**
- Cada tarjeta de viaje incluye un botón **"🗺️ Ver Ruta"**
- Al hacer clic, se abre Google Maps con la ruta completa desde origen a destino
- Funciona tanto con direcciones en texto como con coordenadas (si están disponibles)

### 3. **API de Geocoding**
- Endpoint: `GET /api/geocode?address=Dirección`
- Convierte direcciones en coordenadas (lat/lng)
- Usa OpenStreetMap Nominatim (gratuito, sin API key necesaria)
- Ejemplo:
  ```
  GET /api/geocode?address=Obelisco, Buenos Aires
  ```

## Cómo Funciona

### Backend
1. Al crear un Ride o Request, se pueden incluir coordenadas (opcional)
2. El sistema genera automáticamente un `maps_url` en cada respuesta
3. Si hay coordenadas, las usa para mayor precisión
4. Si no hay coordenadas, usa las direcciones en texto

### Frontend
1. Cada tarjeta muestra un botón verde **"🗺️ Ver Ruta"**
2. Al hacer clic, se abre una nueva pestaña con Google Maps
3. Maps muestra la ruta con instrucciones de navegación

## Uso Futuro

### Integración con Geocoding (Opcional)
Cuando el usuario escribe una dirección en los formularios, puedes:

1. Llamar a `/api/geocode?address=Dirección` mientras escribe (debounce)
2. Obtener las coordenadas automáticamente
3. Guardarlas al crear el viaje para mayor precisión

### Ejemplo de uso del endpoint de geocoding:

```javascript
// En el frontend, al crear un viaje:
const geocodeAddress = async (address) => {
  const response = await fetch(`${API_URL}/geocode?address=${encodeURIComponent(address)}`)
  const data = await response.json()
  if (data.lat && data.lng) {
    return { lat: data.lat, lng: data.lng }
  }
  return null
}

// Al publicar un viaje:
const originCoords = await geocodeAddress(offer.origin)
const destCoords = await geocodeAddress(offer.destination)

const rideData = {
  ...offer,
  origin_lat: originCoords?.lat,
  origin_lng: originCoords?.lng,
  destination_lat: destCoords?.lat,
  destination_lng: destCoords?.lng
}
```

## Beneficios

✅ **Mejora la UX**: Los usuarios pueden ver la ruta directamente
✅ **Facilita la gestión**: Conductor y pasajero tienen claridad sobre el trayecto
✅ **Estimula el uso**: Funcionalidad visual y práctica
✅ **Sin costo adicional**: Usa APIs gratuitas (Google Maps URLs + OpenStreetMap)


