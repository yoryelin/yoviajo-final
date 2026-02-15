import requests
import random
from datetime import date

API_URL = "http://localhost:8003/api/register"

def simulate():
    print("--- INICIANDO SIMULACION DE REGISTRO ---")
    
    # CASO 1: MENOR DE EDAD (15 años)
    dni_minor = str(random.randint(10000000, 99999999))
    birth_minor = (date.today().replace(year=date.today().year - 15)).isoformat()
    
    print(f"\n1. Intentando registrar MENOR de edad (15 años)...")
    print(f"   DNI: {dni_minor}, Fecha Nacimiento: {birth_minor}")
    
    payload_minor = {
        "dni": dni_minor,
        "email": f"minor_{dni_minor}@test.com",
        "password": "password123",
        "name": "Joven Prueba",
        "role": "P",
        "phone": "111222333",
        "birth_date": birth_minor,
        "address": "Calle Falsa 123"
    }
    
    try:
        res = requests.post(API_URL, json=payload_minor)
        if res.status_code == 422:
            print("   CORRECTO: El sistema BLOQUEO el registro.")
            try:
                print(f"   Respuesta del servidor: {res.json()['detail'][0]['msg']}")
            except:
                print(f"   Respuesta del servidor: {res.text}")
        elif res.status_code == 400 and "mayor de 18" in res.text:
             print("   CORRECTO: El sistema BLOQUEO el registro (Validacion manual).")
             print(f"   Mensaje: {res.json()['detail']}")
        else:
            print(f"   FALLO: El sistema permitio el registro o dio otro error. Status: {res.status_code}")
            print(res.text)
    except Exception as e:
        print(f"   ERROR DE CONEXION: {e}")

    # CASO 2: MAYOR DE EDAD (25 años)
    dni_adult = str(random.randint(10000000, 99999999))
    birth_adult = (date.today().replace(year=date.today().year - 25)).isoformat()
    
    print(f"\n2. Intentando registrar MAYOR de edad (25 años)...")
    print(f"   DNI: {dni_adult}, Fecha Nacimiento: {birth_adult}")
    
    payload_adult = {
        "dni": dni_adult,
        "email": f"adult_{dni_adult}@test.com",
        "password": "password123",
        "name": "Adulto Prueba",
        "role": "P",
        "phone": "111222333",
        "birth_date": birth_adult,
        "address": "Calle Real 456"
    }

    try:
        res = requests.post(API_URL, json=payload_adult)
        if res.status_code == 200:
            print("   CORRECTO: El sistema PERMITIO el registro.")
            user = res.json()
            print(f"   Usuario creado ID: {user['id']}, Estado: {'Activo' if user['is_active'] else 'Pendiente'}")
        else:
             print(f"   RESULTADO INESPERADO. Status: {res.status_code}")
             print(res.text)
    except Exception as e:
        print(f"   ERROR DE CONEXION: {e}")

    print("\n--- FIN DE SIMULACION ---")

if __name__ == "__main__":
    simulate()
