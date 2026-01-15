# 🧪 Guía de Pruebas - YoViajo!

## Paso 1: Verificar Imports del Backend

Ejecuta desde la carpeta `backend`:
```bash
python test_imports.py
```

Deberías ver: `✅ ¡Todos los imports funcionan correctamente!`

---

## Paso 2: Configurar Variables de Entorno

1. En `backend/`, copia el ejemplo:
   ```bash
   copy .env.example .env
   ```

2. Edita `.env` y genera una SECRET_KEY (mínimo 32 caracteres):
   ```
   SECRET_KEY=tu_clave_secreta_minimo_32_caracteres_aqui
   ```

---

## Paso 3: Iniciar el Backend

Desde `backend/`:
```bash
python run.py
```

O con uvicorn directamente:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

Deberías ver:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
INFO:     Application startup complete.
```

Abre en el navegador: `http://127.0.0.1:8001/docs` (documentación interactiva)

---

## Paso 4: Iniciar el Frontend

Desde `frontend/`:
```bash
npm install  # Solo la primera vez
npm run dev
```

Deberías ver:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## Paso 5: Pruebas de Flujo Completo

### 5.1 Registro de Usuario
1. Abre `http://localhost:5173/`
2. Deberías ver la pantalla de Login
3. Haz clic en "Regístrate gratis"
4. Completa:
   - Nombre: "Juan Pérez"
   - Email: "juan@test.com"
   - Contraseña: "password123"
5. Haz clic en "CREAR CUENTA"
6. Deberías ver: "¡Cuenta creada! Ahora inicia sesión."

### 5.2 Login
1. Con el mismo email y contraseña, haz clic en "INICIAR SESIÓN"
2. Deberías ser redirigido al Dashboard
3. En la esquina superior derecha deberías ver tu nombre y botón "Salir"

### 5.3 Publicar un Viaje (Oferta)
1. En el Dashboard, columna izquierda "Publicar Oferta"
2. Completa:
   - Origen: "Buenos Aires"
   - Destino: "Mar del Plata"
   - Fecha: Selecciona una fecha futura
   - Precio: "5000"
3. Haz clic en "PUBLICAR VIAJE"
4. Deberías ver: "¡Publicado!"
5. El viaje debería aparecer en "Ofertas Recientes"

### 5.4 Ver Ruta en Maps
1. En cualquier tarjeta de viaje, haz clic en "🗺️ Ver Ruta"
2. Se debería abrir Google Maps en una nueva pestaña con la ruta

### 5.5 Crear una Solicitud
1. En el Dashboard, columna derecha "Pedir Viaje"
2. Completa:
   - Origen: "Córdoba"
   - Destino: "Rosario"
   - Fecha: Selecciona una fecha futura
   - Oferta: "3000"
3. Haz clic en "SOLICITAR ASIENTO"
4. Deberías ver: "¡Solicitado!"
5. La solicitud debería aparecer en "Solicitudes Recientes"

### 5.6 Logout
1. Haz clic en "Salir" en la esquina superior derecha
2. Deberías ser redirigido a la pantalla de Login

---

## Paso 6: Probar Endpoints con la Documentación Interactiva

1. Abre `http://127.0.0.1:8001/docs`
2. Prueba estos endpoints:

### GET /
- Haz clic en "Try it out" → "Execute"
- Deberías ver: `{"message": "YoViajo API funcionando 🚀", ...}`

### POST /api/register
1. Expande "POST /api/register"
2. Haz clic en "Try it out"
3. Ejemplo de Request body:
   ```json
   {
     "email": "test@example.com",
     "name": "Test User",
     "password": "testpass123"
   }
   ```
4. Execute → Deberías ver respuesta 200 con el usuario creado

### POST /api/login
1. Expande "POST /api/login"
2. Usa las credenciales del usuario creado
3. Ejemplo:
   ```json
   {
     "email": "test@example.com",
     "password": "testpass123"
   }
   ```
4. Execute → Deberías ver `access_token` y `user`

### POST /api/rides/ (Protegido)
1. Expande "POST /api/rides/"
2. Haz clic en "Authorize" (🔓)
3. Pega el `access_token` obtenido del login
4. Ejemplo de Request body:
   ```json
   {
     "origin": "Buenos Aires",
     "destination": "Mendoza",
     "departure_time": "2024-12-25T10:00:00",
     "price": 8000,
     "available_seats": 3
   }
   ```
5. Execute → Deberías ver respuesta 200 con el viaje creado (incluye `maps_url`)

---

## Checklist de Verificación

- [ ] Backend inicia sin errores
- [ ] Frontend inicia sin errores
- [ ] Pantalla de Login se muestra
- [ ] Registro de usuario funciona
- [ ] Login funciona y redirige al Dashboard
- [ ] Publicar viaje funciona (requiere auth)
- [ ] Crear solicitud funciona (requiere auth)
- [ ] Botón "Ver Ruta" abre Google Maps
- [ ] Logout funciona
- [ ] API Docs (`/docs`) es accesible
- [ ] Endpoints protegidos requieren token

---

## Problemas Comunes

### Error: "ModuleNotFoundError: No module named 'app'"
**Solución**: Asegúrate de estar ejecutando desde la carpeta `backend/` o usar `python -m uvicorn app.main:app`

### Error: "No es posible conectar con el servidor remoto"
**Solución**: Verifica que el backend esté corriendo en `http://127.0.0.1:8001`

### Error: "401 Unauthorized" al crear viaje
**Solución**: Asegúrate de estar logueado. El token se guarda automáticamente en localStorage.

### Error: "Token inválido"
**Solución**: Haz logout y login nuevamente. El token puede haber expirado.

---

## ✅ Si todas las pruebas pasan:

¡Felicidades! El sistema está funcionando correctamente:
- ✅ Autenticación completa
- ✅ Endpoints protegidos
- ✅ Geolocalización con Maps
- ✅ Frontend integrado
- ✅ Estructura modular


