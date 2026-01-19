import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import TicketCard from '../components/TicketCard'
import PassengerActionModal from '../components/PassengerActionModal'

const MyTrips = () => {
    const { user, authFetch } = useAuth()
    const [myRides, setMyRides] = useState([])
    const [myBookings, setMyBookings] = useState([])
    const [myRequests, setMyRequests] = useState([])
    const [loading, setLoading] = useState(true)

    const [actionModal, setActionModal] = useState({
        isOpen: false,
        type: null,
        booking: null
    })

    const RAW_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8003'
    const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`
    const isDriver = user?.role === 'C'

    useEffect(() => {
        fetchData()
    }, [user])

    const fetchData = async () => {
        setLoading(true)
        console.log("MyTrips: Fetching data...", { isDriver, user })
        try {
            if (isDriver) {
                const res = await authFetch(`${API_URL}/rides/me`)
                if (res.ok) {
                    const data = await res.json()
                    console.log("MyTrips: Rides fetched:", data)
                    setMyRides(data)
                } else {
                    console.error("MyTrips: Error fetching rides", res.status)
                }
            } else {
                const resBookings = await authFetch(`${API_URL}/bookings/me`)
                if (resBookings.ok) {
                    const data = await resBookings.json()
                    console.log("MyTrips: Bookings fetched:", data)
                    setMyBookings(data)
                }

                const resRequests = await authFetch(`${API_URL}/requests/me`)
                if (resRequests.ok) {
                    const data = await resRequests.json()
                    console.log("MyTrips: Requests fetched:", data)
                    setMyRequests(data)
                }
            }
        } catch (error) {
            console.error("Error loading trips:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleActionRequest = (booking, type) => {
        setActionModal({ isOpen: true, type, booking })
    }

    const handleConfirmAction = async (booking, type) => {
        setActionModal(prev => ({ ...prev, isOpen: false }))

        if (type === 'cancel') {
            try {
                const res = await authFetch(`${API_URL}/bookings/${booking.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelled' })
                })
                if (res.ok) {
                    alert("Reserva cancelada.")
                    fetchData()
                } else {
                    const data = await res.json()
                    alert(`Error: ${data.detail}`)
                }
            } catch (e) {
                console.error(e)
                alert("Error de conexión")
            }
        }

        if (type === 'report') {
            try {
                const targetId = booking.ride?.driver_id || booking.driver_id
                if (!targetId) {
                    alert("Error: No se pudo identificar al conductor.")
                    return
                }

                const res = await authFetch(`${API_URL}/reports/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ride_id: booking.ride_id,
                        target_user_id: targetId,
                        reason: 'no_show'
                    })
                })
                if (res.ok) {
                    alert("Reporte enviado correctamente. Gracias por ayudarnos a mantener la calidad.")
                } else {
                    const data = await res.json()
                    alert(`Error: ${data.detail}`)
                }
            } catch (e) {
                console.error(e)
                alert("Error de conexión")
            }
        }
    }

    return (
        <div className="w-full">
            <PassengerActionModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
                actionType={actionModal.type}
                booking={actionModal.booking}
                onConfirm={handleConfirmAction}
            />

            <div className="mb-8">
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    <span className="text-4xl">{isDriver ? '🚖' : '🎒'}</span>
                    Mis Viajes
                </h2>
                <p className="text-slate-400 mt-2">Gestiona tus actividad y revisa el historial.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* DRIVER VIEW */}
                    {isDriver && (
                        <section>
                            <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                                <span>📢</span> Mis Ofertas Publicadas
                            </h3>
                            {myRides.length === 0 ? (
                                <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                                    <p className="text-slate-500">No has publicado viajes aún.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2">
                                    {myRides.map(ride => (
                                        <div key={ride.id} className="relative group">
                                            {ride.matches_count > 0 && ride.status === 'active' && (
                                                <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-white/20 animate-pulse">
                                                    🔥 {ride.matches_count} pas. esperando
                                                </div>
                                            )}
                                            <TicketCard
                                                type="ride"
                                                data={ride}
                                                isManagement={true}
                                                manageAction={() => alert("Funcionalidad de Edición pendiente")}
                                                user={user}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* PASSENGER VIEW */}
                    {!isDriver && (
                        <>
                            <section>
                                <h3 className="text-xl font-bold text-pink-400 mb-6 flex items-center gap-2">
                                    <span>🎟️</span> Mis Reservas
                                </h3>
                                {myBookings.length === 0 ? (
                                    <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                                        <p className="text-slate-500">No tienes reservas activas.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {myBookings.map(booking => (
                                            <TicketCard
                                                key={booking.id}
                                                type="booking"
                                                data={booking}
                                                isManagement={false}
                                                onManage={(data) => handleActionRequest(data, 'cancel')}
                                                onReport={(data) => handleActionRequest(data, 'report')}
                                                user={user}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                                    <span>🙋‍♂️</span> Mis Solicitudes
                                </h3>
                                {myRequests.length === 0 ? (
                                    <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                                        <p className="text-slate-500">No tienes solicitudes pendientes.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {myRequests.map(req => (
                                            <div key={req.id} className="relative">
                                                {req.matches_count > 0 && (
                                                    <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-emerald-400 to-green-500 text-slate-900 text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-white/20 animate-pulse">
                                                        ✨ {req.matches_count} coincidencias
                                                    </div>
                                                )}
                                                <TicketCard
                                                    type="request"
                                                    data={req}
                                                    isManagement={true}
                                                    user={user}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default MyTrips
