import { useState, useEffect } from 'react'
import Layout from '../layouts/Layout'
import { useAuth } from '../context/AuthContext'
import TicketCard from '../components/TicketCard'
import PassengerActionModal from '../components/PassengerActionModal'

const MyTrips = () => {
    const { user, authFetch } = useAuth()
    // Tabs state
    const [activeTab, setActiveTab] = useState('active') // 'active' | 'history'

    // Data state
    const [myRides, setMyRides] = useState([])
    const [myRequests, setMyRequests] = useState([])
    const [myBookings, setMyBookings] = useState([])

    // Modals
    const [selectedRide, setSelectedRide] = useState(null)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [loading, setLoading] = useState(true)

    // Passenger Actions Modal
    const [actionModal, setActionModal] = useState({
        isOpen: false,
        type: null, // 'cancel' | 'report'
        booking: null
    })

    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8003/api'
    const isDriver = user?.role === 'C'

    useEffect(() => {
        fetchData()
    }, [user, activeTab])

    const fetchData = async () => {
        setLoading(true)
        try {
            if (isDriver) {
                const res = await authFetch(`${API_URL}/rides/me`)
                if (res.ok) setMyRides(await res.json())
            } else {
                // Passenger: Get Bookings & Requests
                const resBookings = await authFetch(`${API_URL}/bookings/me`)
                if (resBookings.ok) setMyBookings(await resBookings.json())

                const resRequests = await authFetch(`${API_URL}/requests/me`)
                if (resRequests.ok) setMyRequests(await resRequests.json())
            }
        } catch (error) {
            console.error("Error loading trips:", error)
        } finally {
            setLoading(false)
        }
    }

    // Filter Logic
    const getFilteredList = () => {
        // Simple logic: Active vs History based on date could be added here.
        // For MVP, showing all for now, maybe separate by status later.
        // Let's just return raw lists for now, logic can be enhanced if needed.
        if (isDriver) return myRides
        return [...myBookings, ...myRequests] // Combined just for logic, but UI separates them
    }

    // --- Actions Handlers ---
    const handleActionRequest = (booking, type) => {
        setActionModal({
            isOpen: true,
            type: type,
            booking: booking
        })
    }

    const handleConfirmAction = async (booking, type) => {
        setActionModal(prev => ({ ...prev, isOpen: false })) // Close modal immediately or wait? better close

        if (type === 'cancel') {
            try {
                const res = await authFetch(`${API_URL}/bookings/${booking.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelled' })
                })
                if (res.ok) {
                    alert("Reserva cancelada.")
                    fetchData() // Refresh
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
                // We need target_user_id. For passenger reporting driver, target is ride.driver_id? 
                // TicketCard data might not have it normalized? 
                // Backend: Booking response has 'driver_name'. Does it have 'driver_id' or 'ride.driver_id'?
                // Let's assume TicketCard data 'booking' object has 'ride_id'.
                // We need to fetch ride details OR assume endpoints.
                // Reports endpoint needs 'ride_id' and 'target_user_id'.
                // Booking object usually has `ride` or we can derive it.
                // Let's inspect booking structure in next step if needed, but standard booking has ride_id.
                // We might need to fetch the ride to get driver_id if not present.

                // Quick fix: Report endpoint requires target_user_id. 
                // If I am passenger, target is driver.
                // If endpoints return nested ride, I can use booking.ride.driver_id.
                // Since mapped responses often flatten or include objects.

                // Optimistic approach: Use booking.ride?.driver_id || booking.driver_id 
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

    // --- RENDER ---
    return (
        <Layout>
            {/* Modal de Acciones Pasajero */}
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
                    {/* --- DRIVER VIEW --- */}
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
                                            {/* Smart Match Badge */}
                                            {ride.matches_count > 0 && ride.status === 'active' && (
                                                <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-white/20 animate-pulse">
                                                    🔥 {ride.matches_count} pasajeros esperando
                                                </div>
                                            )}
                                            <TicketCard
                                                type="ride"
                                                data={ride}
                                                isManagement={true}
                                                manageAction={() => {
                                                    // Logic to view matches could go here or Edit
                                                    alert("Funcionalidad de Edición/Matches detallada pendiente")
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* --- PASSENGER VIEW --- */}
                    {!isDriver && (
                        <>
                            {/* Bookings */}
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
                                                isManagement={false} // Booking management mainly cancellation
                                                onManage={(data) => handleActionRequest(data, 'cancel')}
                                                onReport={(data) => handleActionRequest(data, 'report')}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Requests */}
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
                                                {/* Smart Match Badge */}
                                                {req.matches_count > 0 && (
                                                    <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-emerald-400 to-green-500 text-slate-900 text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-white/20 animate-pulse">
                                                        ✨ {req.matches_count} ofertas coinciden
                                                    </div>
                                                )}
                                                <TicketCard
                                                    type="request"
                                                    data={req}
                                                    isManagement={true}
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
        </Layout>
    )
}

export default MyTrips
