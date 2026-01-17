"""
Rutas de Pagos (Integración AstroPay Mock).
Simula la creación de links de pago y webhooks para probar el flujo sin credenciales reales.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment
from app.api.deps import get_current_user
from app.config import settings
from app.core.logger import logger
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/payments", tags=["payments"])

@router.post("/create_preference/{booking_id}")
def create_payment_preference(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Genera un link de pago (Mock) para una reserva.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    # Validar que sea el pasajero
    if booking.passenger_id != current_user.id:
        raise HTTPException(status_code=403, detail="No puedes pagar una reserva ajena")

    # Calcular Fee (10% del share)
    # Share = (Total Liters * Price) / Seats?
    # Simplificación: Usamos Ride Price (que ahora es Liters * FuelPrice?)
    # El Frontend manda Offer.price estimado.
    # Vamos a calcularlo fresh:
    if not booking.ride:
         raise HTTPException(status_code=400, detail="Viaje inválido")

    # Litros Totales del viaje
    liters_total = booking.ride.fuel_liters_total
    # Ocupantes estimados (ej. 4)
    seats_total = 4 
    
    liters_per_seat = liters_total / seats_total
    price_ars = liters_per_seat * settings.FUEL_PRICE_ARS
    
    # Fee del 10%
    fee_amount = price_ars * 0.10
    
    # Crear registro de Pago PENDING
    external_id = str(uuid.uuid4())
    
    new_payment = Payment(
        booking_id=booking.id,
        external_id=external_id,
        amount=fee_amount,
        status="pending"
    )
    db.add(new_payment)
    # Actualizar estado reserva
    booking.status = BookingStatus.AWAITING_PAYMENT.value
    db.commit()
    
    # Generar Mock Link
    # En prod real, llamaríamos a AstroPay API aquí
    mock_url = f"{settings.API_URL}/api/payments/mock_checkout/{external_id}"
    
    return {
        "init_point": mock_url,
        "preference_id": external_id,
        "amount": fee_amount
    }

@router.get("/mock_checkout/{external_id}", response_class=HTMLResponse)
def mock_checkout_page(external_id: str, db: Session = Depends(get_db)):
    """
    Simula la página de pago de AstroPay.
    """
    payment = db.query(Payment).filter(Payment.external_id == external_id).first()
    if not payment:
         return "<h1>Error: Pago no encontrado</h1>"
    
    return f"""
    <html>
        <head>
            <title>AstroPay MOCK Checkout</title>
            <style>
                body {{ font-family: sans-serif; display: flex; justify-content: center; items-align: center; height: 100vh; background: #f0f2f5; }}
                .card {{ background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }}
                .btn {{ background: #D32F2F; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 20px; }}
                .btn:hover {{ background: #B71C1C; }}
            </style>
        </head>
        <body>
            <div class="card">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AstroPay_Logo.svg/1200px-AstroPay_Logo.svg.png" width="200" style="margin-bottom: 20px;">
                <h2>Confirmar Pago de Fee</h2>
                <p>Monto a pagar: <strong>$ {payment.amount:.2f} ARS</strong></p>
                <form action="/api/payments/webhook_mock_submit" method="post">
                    <input type="hidden" name="external_id" value="{external_id}">
                    <button type="submit" class="btn">Pagar Ahora 💳</button>
                </form>
            </div>
        </body>
    </html>
    """

@router.post("/webhook_mock")
def webhook_mock(
    request: Request,
    external_id: str = None, # Form data handling needs Form() or Pydantic
    db: Session = Depends(get_db)
):
    # Quick fix for Form Data in simple HTML form
    # We'll expect query params or form data.
    pass 
    # Implementación real abajo usando ruta dedicada para form submit por simplicidad
    return {"status": "ok"}

@router.post("/webhook_mock_submit")
async def webhook_mock_submit(request: Request, db: Session = Depends(get_db)):
    form_data = await request.form()
    external_id = form_data.get("external_id")
    
    payment = db.query(Payment).filter(Payment.external_id == external_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
        
    payment.status = "approved"
    
    # Unlock Booking
    if payment.booking:
        payment.booking.status = BookingStatus.CONFIRMED.value # O PENDING si requiere aprobación conductor
        # Aquí es donde el "Candado" se abre
        
    db.commit()
    
    # Redirigir al frontend success page
    # En desarrollo local: http://localhost:5173/my-trips
    # En prod: https://yoviajo-frontend.onrender.com/my-trips
    # Usaremos una simple HTML de éxito que cierre la ventana o redirija
    return HTMLResponse("""
    <html>
        <body>
            <h1>¡Pago Exitoso! ✅</h1>
            <p>Redirigiendo a YoViajo...</p>
            <script>
                setTimeout(() => {
                    window.location.href = '/'; 
                }, 2000);
            </script>
        </body>
    </html>
    """)
