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

    const totalPrice = ride.price * seats

    const handleConfirm = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await authFetch(`${API_URL}/bookings/`, {
                method: 'POST',
                body: JSON.stringify({
                    ride_id: ride.id,
                    seats_booked: seats
                })
            })

            if (response.ok) {
                onReserveSuccess()
                onClose()
                alert(`✅ ¡Reserva Exitosa!\n\nViaje: ${ride.origin} → ${ride.destination}\nAsientos: ${seats}\nTotal: $${totalPrice}`)
            } else {
                const data = await response.json()
                let errorMsg = 'Error al realizar la reserva'
                if (data.detail) errorMsg = data.detail
                setError(errorMsg)
            }
        } catch (e) {
            setError('Error de conexión con el servidor')
        } finally {
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
                    {/* Header con gradiente */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center">
                        <h2 className="text-2xl font-black uppercase tracking-widest">Confirmar Reserva</h2>
                        <p className="text-emerald-100 text-sm font-medium mt-1">Asegura tu lugar en este viaje</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Detalles del Viaje */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-bold uppercase">Origen</span>
                                <span className="text-white font-bold">{ride.origin}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-bold uppercase">Destino</span>
                                <span className="text-white font-bold">{ride.destination}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-bold uppercase">Conductor</span>
                                <span className="text-white font-bold">{ride.driver_name || 'Conductor'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400 font-bold uppercase">Fecha</span>
                                <span className="text-white font-bold">{ride.departure_time ? new Date(ride.departure_time).toLocaleString() : 'Pendiente'}</span>
                            </div>
                        </div>

                        {/* Selector de Asientos */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cantidad de Asientos</label>
                            <div className="flex items-center gap-4 bg-slate-950 p-2 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setSeats(Math.max(1, seats - 1))}
                                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition"
                                >
                                    -
                                </button>
                                <div className="flex-1 text-center">
                                    <span className="text-2xl font-black text-white">{seats}</span>
                                    <span className="text-xs text-slate-500 block">de {ride.available_seats} disp.</span>
                                </div>
                                <button
                                    onClick={() => setSeats(Math.min(ride.available_seats, seats + 1))}
                                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center py-4 border-t border-slate-700">
                            <span className="text-slate-400 font-bold uppercase">Total a Pagar</span>
                            <span className="text-4xl font-black text-emerald-400">${totalPrice}</span>
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
                                className="py-3 rounded-xl border-2 border-slate-700 text-slate-400 font-bold hover:border-slate-500 hover:text-white transition uppercase tracking-widest text-xs"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20 transition transform active:scale-95 uppercase tracking-widest text-xs"
                            >
                                {loading ? 'Reservando...' : 'Confirmar Reserva'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
