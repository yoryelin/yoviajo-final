
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

    def create_preference(self, booking_id: int, title: str, price: float, payer_email: str):
        """
        Crea una preferencia de pago en MercadoPago.
        Retorna el ID de la preferencia y la URL de pago (init_point).
        """
        
        # Configuración de URLs de retorno (Back URLs)
        # En producción, estas deben ser URLs reales de tu frontend
        base_url = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS and settings.CORS_ORIGINS[0] != "*" else "http://localhost:5173"
        
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
            "payer": {
                "email": payer_email
            },
            "back_urls": {
                "success": f"{base_url}/dashboard?payment_status=success&booking_id={booking_id}",
                "failure": f"{base_url}/dashboard?payment_status=failure&booking_id={booking_id}",
                "pending": f"{base_url}/dashboard?payment_status=pending&booking_id={booking_id}"
            },
            "auto_return": "approved",
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
