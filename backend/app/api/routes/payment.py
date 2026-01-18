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

@router.post("/simulate")
def simulate_payment(
    data: PaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Simula el pago de del Fee de Reserva.
    En la vida real, aquí interactuaríamos con MercadoPago/Stripe.
    """
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    if booking.passenger_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para pagar esta reserva")

    if booking.payment_status == "paid":
        return {"message": "La reserva ya está pagada", "status": "approved"}

    # 1. Crear Registro de Pago
    payment = Payment(
        booking_id=booking.id,
        external_id=f"PAY-SIM-{datetime.now().timestamp()}",
        status="approved",
        amount=booking.fee_amount,
        currency="ARS",
        payment_url="https://mock.payment.gateway/success"
    )
    db.add(payment)
    
    # 2. Actualizar Reserva
    booking.payment_status = "paid"
    # Si estaba en 'pending' o 'awaiting_payment', ahora pasa a 'confirmed'
    # Asumimos confirmación automática tras el pago para este flujo
    booking.status = BookingStatus.CONFIRMED.value 
    
    db.commit()
    db.refresh(booking)
    
    return {
        "message": "Pago exitoso. Reserva confirmada.",
        "status": "approved",
        "booking_status": booking.status,
        "payment_id": payment.id
    }
