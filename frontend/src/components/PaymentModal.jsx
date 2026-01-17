import { useState } from 'react'

const PaymentModal = ({ isOpen, onClose, ride, authFetch, API_URL, onPaymentSuccess }) => {
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen || !ride) return null

    // Cálculos de Fuel Standard
    const fuelPrice = 1750 // Hardcoded or from Config Context ideally
    const litersTotal = ride.fuel_liters_total || 0
    // Estimate seats (default 4 if not set)
    const seatsTotal = 4

    // Share Calculation
    const litersShare = litersTotal / seatsTotal
    const priceShareArs = litersShare * fuelPrice

    // Fee Calculation (10%)
    const feeAmount = priceShareArs * 0.10

    const handlePayment = async () => {
        setIsLoading(true)
        try {
            // 1. Create Booking (Pending/Awaiting Payment)
            // Primero creamos la reserva en el backend si no existe.
            // O asumimos que la reserva YA se creó al abrir el modal?
            // Mejor flujo: "Reservar" -> "Backend crea booking AwaitingPayment" -> "Frontend abre this modal"
            // Pero Dashboard suele llamar directo a la API.
            // Vamos a hacer: Clicar "Pagar" -> Lanza todo el flujo.

            // Paso A: Crear Reserva
            const bookingRes = await authFetch(`${API_URL}/bookings`, {
                method: 'POST',
                body: JSON.stringify({
                    ride_id: ride.id,
                    seats_booked: 1 // Default 1 seat for now
                })
            })

            if (!bookingRes.ok) {
                const err = await bookingRes.json()
                throw new Error(err.detail || "Error al crear reserva")
            }

            const bookingCalls = await bookingRes.json()
            const bookingId = bookingCalls.id

            // Paso B: Generar Link de Pago
            const paymentRes = await authFetch(`${API_URL}/payments/create_preference/${bookingId}`, {
                method: 'POST'
            })

            if (!paymentRes.ok) throw new Error("Error al generar pago")

            const paymentData = await paymentRes.json()

            // Paso C: Redirigir
            window.location.href = paymentData.init_point

        } catch (e) {
            alert(e.message)
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="bg-gradient-to-r from-pink-600 to-red-600 p-6 text-center">
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">
                        Confirmar Reserva
                    </h2>
                    <p className="text-pink-100 text-sm mt-1">El "Candado" de Seguridad 🔒</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Resumen del Viaje */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400 text-xs uppercase font-bold">Viaje</span>
                            <span className="text-white font-bold">{ride.origin} ➝ {ride.destination}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-xs uppercase font-bold">Fecha</span>
                            <span className="text-white font-bold">{new Date(ride.departure_time).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Desgloce de Costos (Fuel Standard) */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">Tu colaboración (Nafta)</span>
                            <div className="text-right">
                                <span className="block text-white font-bold">{litersShare.toFixed(1)} Litros</span>
                                <span className="text-xs text-slate-500">≈ $ {priceShareArs.toLocaleString()} ARS</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-2 border-t border-slate-700/50">
                            <span className="text-cyan-400 font-bold">Fee de Gestión (10%)</span>
                            <div className="text-right">
                                <span className="block text-cyan-400 font-black text-xl">$ {feeAmount.toLocaleString()} ARS</span>
                                <span className="text-xs text-slate-500">Se abona ahora</span>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                        Al pagar el Fee, desbloqueas los datos del conductor y aseguras tu lugar.
                        El costo de combustible se abona directamente al conductor en el viaje.
                    </p>

                    {/* Action */}
                    <button
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-black py-4 rounded-xl shadow-lg shadow-red-900/20 transition transform active:scale-[0.98] text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Procesando...' : (
                            <>
                                <span>Pagar con AstroPay</span>
                                <span className="text-xl">💳</span>
                            </>
                        )}
                    </button>

                    <button onClick={onClose} className="w-full text-slate-500 text-xs hover:text-white mt-2">
                        Cancelar
                    </button>

                </div>
            </div>
        </div>
    )
}

export default PaymentModal
