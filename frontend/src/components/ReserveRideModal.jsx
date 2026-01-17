import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReserveRideModal({ isOpen, onClose, ride, authFetch, API_URL, onReserveSuccess }) {
    const [seats, setSeats] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen) {
            setSeats(1)
            setError(null)
        }
    }, [isOpen])

    if (!isOpen || !ride) return null

    // Cálculos Económicos (Patrón Nafta)
    const FUEL_PRICE = 1750
    // Usar datos del backend si existen, sino fallback
    const litersPerSeat = ride.price_per_seat_liters || (ride.price / FUEL_PRICE) || 0

    // Costo Colaborativo (Directo al Conductor)
    const fuelCostTotal = (litersPerSeat * seats * FUEL_PRICE).toFixed(0)

    // Fee de Gestión (10% del costo colaborativo)
    const feeAmount = (fuelCostTotal * 0.10).toFixed(0)

    const handlePaymentFlow = async () => {
        setLoading(true)
        setError(null)

        try {
            // PASO 1: Crear Reserva (Pending)
            const bookingRes = await authFetch(`${API_URL}/bookings/`, {
                method: 'POST',
                body: JSON.stringify({
                    ride_id: ride.id,
                    seats_booked: seats
                })
            })

            if (!bookingRes.ok) {
                const data = await bookingRes.json()
                throw new Error(data.detail || 'Error al crear la reserva')
            }

            const bookingData = await bookingRes.json()
            const bookingId = bookingData.id

            // PASO 2: Generar Preferencia de Pago (AstroPay)
            const paymentRes = await authFetch(`${API_URL}/payments/create_preference/${bookingId}`, {
                method: 'POST'
            })

            if (!paymentRes.ok) {
                throw new Error('Error al generar el link de pago')
            }

            const paymentData = await paymentRes.json()

            // PASO 3: Redirección al "Candado" 🔒
            window.location.href = paymentData.init_point

        } catch (e) {
            console.error(e)
            setError(e.message || 'Error de conexión')
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-6 text-white text-center border-b border-white/5">
                        <h2 className="text-xl font-black uppercase tracking-widest flex justify-center items-center gap-2">
                            Confirmar Lugares
                        </h2>
                        <p className="text-cyan-200 text-xs font-medium mt-1">El "Candado" de Seguridad 🔒</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Selector de Asientos */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asientos a Reservar</label>
                            <div className="flex items-center gap-4 bg-slate-950 p-2 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setSeats(Math.max(1, seats - 1))}
                                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition"
                                >
                                    -
                                </button>
                                <div className="flex-1 text-center">
                                    <span className="text-2xl font-black text-white">{seats}</span>
                                    <span className="text-xs text-slate-500 block">lugares</span>
                                </div>
                                <button
                                    onClick={() => setSeats(Math.min(ride.available_seats, seats + 1))}
                                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Desglose de Costos */}
                        <div className="bg-slate-800/30 rounded-xl p-4 space-y-3 border border-slate-700/50">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Colaboración (Nafta)</span>
                                <div className="text-right">
                                    <span className="block text-white font-bold text-lg">${parseInt(fuelCostTotal).toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-500">Se paga al conductor</span>
                                </div>
                            </div>

                            <div className="h-px bg-slate-700/50 my-2"></div>

                            <div className="flex justify-between items-center text-sm">
                                <div className="flex flex-col">
                                    <span className="text-cyan-400 font-bold uppercase tracking-wider">Fee de Gestión</span>
                                    <span className="text-[10px] text-cyan-500/70">Abonar ahora para confirmar</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-cyan-400 font-black text-2xl">${parseInt(feeAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg text-center">
                                <p className="text-red-400 text-xs font-bold">{error}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onClose}
                                className="py-3 rounded-xl border-2 border-slate-700 text-slate-400 font-bold hover:border-slate-500 hover:text-white transition uppercase tracking-widest text-[10px]"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handlePaymentFlow}
                                disabled={loading}
                                className="py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-red-900/20 transition transform active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                            >
                                {loading ? 'Procesando...' : (
                                    <>
                                        <span>Ir a Pagar</span>
                                        <span className="text-base">💳</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-[9px] text-slate-600 text-center px-4">
                            Serás redirigido a AstroPay para completar el pago seguro del Fee.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
