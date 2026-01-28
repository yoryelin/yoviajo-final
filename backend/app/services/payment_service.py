
try:
    import mercadopago
except ImportError:
    mercadopago = None

from app.config import settings

class PaymentService:
    def __init__(self):
        # Initialize MP SDK with the token (Placeholder or Real)
        if mercadopago:
            self.sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)
        else:
            print("⚠️ Warning: MercadoPago SDK not installed or not found.")
            self.sdk = None

    def create_preference(self, booking_id: int, title: str, price: float, payer_email: str, payer_name: str = "Pasajero", payer_surname: str = "YoViajo", payer_dni: str = None):
        """
        Crea una preferencia de pago en MercadoPago.
        Retorna el ID de la preferencia y la URL de pago (init_point).
        """
        
        # Configuración de URLs de retorno (Back URLs)
        # En producción (Render), usamos la URL real.
        # Fallback a localhost solo si estamos en desarrollo explícito.
        
        # Detectar si estamos en producción (basado en si hay un token real configurado, o simplemente hardcode seguro)
        production_url = "https://yoviajo-frontend.onrender.com"
        
        if settings.CORS_ORIGINS and settings.CORS_ORIGINS[0] != "*":
             base_url = settings.CORS_ORIGINS[0]
        else:
             # Si CORS es "*" (default), asumimos producción si no es local, 
             # PERO para asegurar que funcione en Render, forzamos la URL de frontend conocida.
             base_url = production_url

        print(f"🔗 MP Back URL Base: {base_url}") # Debug log
        
        # Construir objeto Payer con datos enriquecidos para evitar CPT01
        payer_data = {
            "email": payer_email,
            "name": payer_name,
            "surname": payer_surname,
        }
        
        if payer_dni:
            payer_data["identification"] = {
                "type": "DNI",
                "number": payer_dni
            }
        
        preference_data = {
            "items": [
                {
                    "id": str(booking_id),
                    "title": title,
                    "quantity": 1,
                    "unit_price": float(price),
                    "currency_id": "ARS" 
                }
            ],
            "payer": payer_data,
            "back_urls": {
                "success": f"{base_url}/dashboard?payment_status=success&booking_id={booking_id}",
                "failure": f"{base_url}/dashboard?payment_status=failure&booking_id={booking_id}",
                "pending": f"{base_url}/dashboard?payment_status=pending&booking_id={booking_id}"
            },
            "auto_return": "approved",
            "binary_mode": True, # IMPORTANTE: Evita pagos pendientes, solo Aprobado o Rechazado
            "external_reference": str(booking_id), # Sirve para conciliar después
            "statement_descriptor": "YO VIAJO APP"
        }

        try:
            if not self.sdk:
                raise Exception("MercadoPago SDK not initialized")
                
            preference_response = self.sdk.preference().create(preference_data)
            
            # Chequeo de Estado HTTP
            if preference_response["status"] not in [200, 201]:
                print(f"❌ MP Error Status: {preference_response['status']}")
                print(f"❌ MP Error Detail: {preference_response.get('response')}")
                return None
            
            response = preference_response["response"]
            
            return {
                "preference_id": response["id"],
                "init_point": response["init_point"], 
                "sandbox_init_point": response["sandbox_init_point"] 
            }
        except Exception as e:
            print(f"Error creando preferencia MP: {e}")
            return None

    def get_payment_info(self, payment_id: str):
        """
        Consulta la información de un pago en MP por su ID.
        """
        try:
            if not self.sdk:
                return None
            
            payment_info = self.sdk.payment().get(payment_id)
            
            if payment_info["status"] == 200:
                return payment_info["response"]
            else:
                print(f"❌ Error getting payment info: {payment_info}")
                return None
        except Exception as e:
            print(f"Error consultando pago MP: {e}")
            return None
