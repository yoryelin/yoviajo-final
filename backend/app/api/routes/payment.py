from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/api/payment", tags=["payment"])

class PaymentRequest(BaseModel):
    booking_id: int


from app.services.payment_service import PaymentService
from fastapi import Request

@router.post("/webhook")
async def payment_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Webhook para recibir notificaciones de MercadoPago.
    """
    try:
        # 1. Obtener parámetros (query o body)
        # MP suele mandar ?topic=payment&id=123 o type=payment
        params = request.query_params
        topic = params.get("topic") or params.get("type")
        payment_id = params.get("id") or params.get("data.id")

        print(f"🔔 Webhook received: {params}")

        if topic == "payment" and payment_id:
            # 2. Consultar estado real a MP
            service = PaymentService()
            payment_info = service.get_payment_info(payment_id)
            
            if payment_info and payment_info.get("status") == "approved":
                # 3. Identificar la Reserva (external_reference)
                external_ref = payment_info.get("external_reference")
                if external_ref:
                    booking_id = int(external_ref)
                    booking = db.query(Booking).filter(Booking.id == booking_id).first()
                    
                    if booking and booking.payment_status != "paid":
                        print(f"💰 Payment Approved for Booking {booking_id}")
                        
                        # 4. Actualizar Booking
                        booking.payment_status = "paid"
                        booking.status = BookingStatus.CONFIRMED.value
                        booking.updated_at = datetime.utcnow()
                        
                        # 5. Crear Registro de Pago (Payment)
                        # Verificamos si ya existe para evitar duplicados
                        existing_payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
                        
                        if not existing_payment:
                            new_payment = Payment(
                                booking_id=booking.id,
                                external_id=str(payment_id),
                                status="approved",
                                amount=payment_info.get("transaction_amount", 0.0),
                                currency=payment_info.get("currency_id", "ARS"),
                                payment_url=None, # Ya se pagó
                                created_at=datetime.utcnow()
                            )
                            db.add(new_payment)
                            print(f"✅ Payment Record created: {new_payment.id}")
                        
                        db.commit()
                        db.refresh(booking)
                        
                        return {"status": "success", "message": "Booking confirmed & Payment recorded"}
            
        return {"status": "ignored"}

    except Exception as e:
        print(f"❌ Webhook Error: {e}")
        # Retornamos 200 siempre a MP para que no reintente infinitamente si es un error lógico nuestro
        return {"status": "error"}

