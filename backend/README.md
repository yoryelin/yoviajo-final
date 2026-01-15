# YoViajo Backend

Backend FastAPI para la aplicación YoViajo!

## Estructura del Proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicación FastAPI principal
│   ├── config.py            # Configuración y variables de entorno
│   ├── database.py          # Configuración de base de datos
│   ├── auth.py              # Utilidades de autenticación
│   ├── utils.py             # Utilidades (geolocalización, etc.)
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── user.py
│   │   └── ride.py
│   ├── schemas/             # Schemas Pydantic
│   │   ├── user.py
│   │   ├── ride.py
│   │   └── request.py
│   └── api/                 # Rutas de la API
│       ├── deps.py          # Dependencias (auth, etc.)
│       └── routes/
│           ├── auth.py      # /api/register, /api/login
│           ├── rides.py     # /api/rides
│           ├── requests.py  # /api/requests
│           └── geocode.py   # /api/geocode
├── requirements.txt
├── .env.example
└── run.py                   # Script para ejecutar el servidor
```

## Instalación

1. Crear entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus valores
```

## Ejecución

```bash
python run.py
```

O directamente con uvicorn:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

## Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

**Importante:** Generar una nueva `SECRET_KEY` para producción (mínimo 32 caracteres).

## API Endpoints

- `GET /` - Info de la API
- `POST /api/register` - Registro de usuario
- `POST /api/login` - Login (devuelve JWT)
- `GET /api/rides/` - Listar viajes
- `POST /api/rides/` - Crear viaje (requiere auth)
- `GET /api/rides/me` - Mis viajes (requiere auth)
- `GET /api/requests/` - Listar solicitudes
- `POST /api/requests/` - Crear solicitud (requiere auth)
- `GET /api/geocode?address=...` - Geocoding

Documentación interactiva: `http://127.0.0.1:8001/docs`


