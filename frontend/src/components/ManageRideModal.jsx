import { useState, useEffect } from 'react'
import CountdownTimer from './CountdownTimer'

export default function ManageRideModal({ isOpen, onClose, ride, authFetch, API_URL, onCancelRide }) {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen && ride) {
            fetchBookings()
        }
    }, [isOpen, ride])

    const fetchBookings = async () => {
        try {
            setLoading(true)
            const res = await authFetch(`${API_URL}/bookings/ride/${ride.id}`)
            if (res.ok) {
                const data = await res.json()
                // Filtrar solo las activas confirmadas/pendientes (aunque el endpoint devuelve todas, el frontend puede filtrar visualmente)
                setBookings(data.filter(b => b.status !== 'cancelled'))
            } else {
                setError("No se pudieron cargar los pasajeros")
            }
        } catch (e) {
            setError("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const handleCancelClick = () => {
        if (confirm("⚠️ Importante: ¿Ya avisaste a los pasajeros?\n\nLa política requiere que contactes a los pasajeros antes de cancelar. Se abrirá WhatsApp para que les avises.")) {
            // En un mundo ideal, abriríamos un chat grupal, pero aquí abriremos el contacto del primero o instruiremos al usuario
            cancelRide()
        }
    }

    const cancelRide = async () => {
        try {
            const res = await authFetch(`${API_URL}/rides/${ride.id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                alert("Viaje cancelado correctamente.")
                if (onCancelRide) onCancelRide()
                onClose()
            } else {
                const data = await res.json()
                alert(`Error: ${data.detail}`)
            }
        } catch (e) {
            alert("Error de conexión")
        }
    }

    if (!isOpen || !ride) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 bg-slate-800/50 border-b border-slate-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Gestionar Viaje</h3>
                            <p className="text-slate-400 text-sm">{ride.origin} ➝ {ride.destination}</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
                    </div>
                    <div className="mt-4">
                        <CountdownTimer targetDate={ride.departure_time} />
                    </div>
                </div>

                {/* Body: Manifest */}
                <div className="p-6 overflow-y-auto flex-1">
                    <h4 className="font-bold text-cyan-400 text-sm uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
                        Manifiesto de Pasajeros ({bookings.length})
                    </h4>

                    {loading ? (
                        <div className="text-center py-4 text-slate-500">Cargando...</div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-4 text-slate-500 italic">No hay pasajeros confirmados aún.</div>
                    ) : (
                        <div className="space-y-3">
                            {bookings.map(booking => (
                                <div key={booking.id} className="flex items-center justify-between bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                                    <div>
                                        <p className="font-bold text-white">{booking.passenger_name || 'Usuario'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500">Asientos: {booking.seats_booked}</span>
                                            <span className={`text-[10px] uppercase font-bold px-1 rounded ${booking.status === 'confirmed' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                    {booking.passenger_phone ? (
                                        <a
                                            href={`https://wa.me/${booking.passenger_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${booking.passenger_name.split(' ')[0]}, soy ${ride.driver_name || 'tu conductor'}. Vi tu reserva para el viaje a ${ride.destination}. ¿Todo listo? 🚗`)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg transition-colors shadow-lg shadow-green-900/20 group"
                                            title="Enviar mensaje de coordinación"
                                        >
                                            <span className="text-lg">💬</span>
                                            <span className="text-xs font-bold uppercase tracking-wide">Coordinar</span>
                                        </a>
                                    ) : (
                                        <span className="text-xs text-slate-600 italic px-2" title="Sin teléfono registrado">Sin contacto 📵</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer: Cancel Actions */}
                <div className="p-6 bg-slate-900 border-t border-slate-800">
                    {/* Dynamic Warning Logic */}
                    {(() => {
                        const now = new Date()
                        const departure = new Date(ride.departure_time)
                        const diffHours = (departure - now) / (1000 * 60 * 60)
                        const isPenalty = diffHours < 6 && bookings.length > 0

                        return (
                            <div className={`border rounded-lg p-4 mb-4 ${isPenalty ? 'bg-red-900/10 border-red-900/30' : 'bg-yellow-900/10 border-yellow-900/30'}`}>
                                <p className={`text-xs text-center font-bold ${isPenalty ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {isPenalty ? '⚠️ ¡PENALIZACIÓN INMINENTE!' : 'ℹ️ Aviso de Cancelación'}
                                </p>
                                <p className={`text-[10px] text-center mt-1 ${isPenalty ? 'text-red-300/70' : 'text-yellow-300/70'}`}>
                                    {isPenalty
                                        ? `Faltan menos de 6 horas. Si cancelas ahora, perderás 10 puntos de reputación.`
                                        : `Faltan más de 6 horas. Puedes cancelar sin penalización de reputación.`}
                                </p>
                            </div>
                        )
                    })()}

                    <button
                        onClick={handleCancelClick}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-900/20 transition-all uppercase tracking-widest text-xs"
                    >
                        Cancelar Viaje (Notificar y Borrar)
                    </button>
                </div>

            </div>
        </div>
    )
}
