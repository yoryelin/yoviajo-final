import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import TicketCard from '../components/TicketCard'
import PassengerActionModal from '../components/PassengerActionModal'
import ReviewModal from '../components/reviews/ReviewModal'
import OfferRideModal from '../components/OfferRideModal'
import { API_URL } from '@config/api.js'

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

    const [offerModal, setOfferModal] = useState({
        isOpen: false,
        rideData: null
    })

    const [matches, setMatches] = useState([])
    const [expandedTicketId, setExpandedTicketId] = useState(null)

    // New: Store bookings for specific rides (for Driver view)
    const [rideBookings, setRideBookings] = useState({})
    const [expandedBookingsId, setExpandedBookingsId] = useState(null)

    // Review Modal State
    const [reviewModal, setReviewModal] = useState({ isOpen: false, booking: null })

    const isDriver = user?.role === 'C'

    useEffect(() => {
        fetchData()
    }, [user])

    const fetchRideBookings = async (rideId) => {
        if (rideBookings[rideId]) return // Already fetched
        try {
            const res = await authFetch(`${API_URL}/bookings/ride/${rideId}`)
            if (res.ok) {
                const data = await res.json()
                setRideBookings(prev => ({ ...prev, [rideId]: data }))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const toggleBookings = (rideId) => {
        if (expandedBookingsId === rideId) {
            setExpandedBookingsId(null)
        } else {
            setExpandedBookingsId(rideId)
            fetchRideBookings(rideId)
        }
    }

    const fetchData = async () => {
        setLoading(true)
        console.log("MyTrips: Fetching data...", { isDriver, user })
        try {
            // 1. Fetch Matches (Coincidencias)
            const resMatches = await authFetch(`${API_URL}/matches`)
            if (resMatches.ok) {
                const data = await resMatches.json()
                console.log("MyTrips: Matches fetched:", data)
                setMatches(data)
            }

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

    const handleEditRide = (ride) => {
        setOfferModal({
            isOpen: true,
            rideData: ride
        })
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

    const handleMatchAction = async (matchData) => {
        console.log("Match Action:", matchData)
        if (isDriver) {
            // Driver Flow: Invite Passenger
            try {
                const res = await authFetch(`${API_URL}/matches/invite`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        request_id: matchData.request_id,
                        ride_id: matchData.ride_id
                    })
                })
                if (res.ok) {
                    alert(`Has invitado a ${matchData.candidate_user.name}. Se le ha enviado una notificación para que realice el pago.`)
                } else {
                    const err = await res.json()
                    alert(`Error: ${err.detail}`)
                }
            } catch (e) {
                console.error(e)
                alert("Error enviando invitación")
            }
        } else {
            // Passenger Flow: Create Booking & Pay
            try {
                // 1. Create Booking
                const payload = {
                    ride_id: matchData.ride_id,
                    seats_booked: 1 // Default 1 seat for match
                }
                const res = await authFetch(`${API_URL}/bookings/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })

                if (res.ok) {
                    const bookingData = await res.json()
                    // 2. Redirect to MercadoPago
                    if (bookingData.payment_init_point) {
                        window.location.href = bookingData.payment_init_point
                    } else {
                        alert("Reserva creada. Ve a 'Mis Reservas' para completar el pago.")
                        fetchData()
                    }
                } else {
                    const err = await res.json()
                    alert(`Error al reservar: ${err.detail}`)
                }
            } catch (error) {
                console.error("Booking Error:", error)
                alert("Error de conexión al procesar la reserva.")
            }
        }
    }

    const handleReviewSubmit = async (reviewData) => {
        try {
            const res = await authFetch(`${API_URL}/reviews/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            })
            if (res.ok) {
                alert("¡Gracias por tu calificación!")
                fetchData() // Refresh to potentially hide the button or update status
            } else {
                const err = await res.json()
                alert(`Error: ${err.detail}`)
            }
        } catch (e) {
            console.error(e)
            alert("Error al enviar reseña")
        }
    }

    // Helper: Filter old items (24h rule)
    const shouldShowItem = (item) => {
        // If cancelled by system/user, maybe still show but marked? 
        // User asked to REMOVE active ones if > 24h. 
        // We will filter out anything that is clearly past execution time + 24h.

        let targetTime = null;
        if (item.departure_time) targetTime = item.departure_time; // Rides / Booking.ride
        else if (item.ride?.departure_time) targetTime = item.ride.departure_time; // Booking with relation
        else if (item.time_window_start) targetTime = item.time_window_start; // Requests (using start of window)

        if (!targetTime) return true; // Fallback

        // Check format. If 'HH:MM' (generic time), we can't filter by date properly unless we have the date field too.
        // Assuming ISO string or date + time. 
        // Rides have 'departure_time' as ISO8601 usually.
        // Requests have 'date' and 'time_window_start'.

        let dateObj = new Date(targetTime);
        if (isNaN(dateObj.getTime())) {
            // It might be split (Requests)
            if (item.date && item.time_window_start) {
                dateObj = new Date(`${item.date}T${item.time_window_start}`);
            } else {
                return true;
            }
        }

        const now = new Date();
        const diffHours = (now - dateObj) / (1000 * 60 * 60);

        // If diffHours > 24 (24 hours passed since departure), hide it.
        if (diffHours > 24) return false;

        return true;
    }

    const visibleRides = myRides.filter(shouldShowItem);
    const visibleBookings = myBookings.filter(shouldShowItem);
    const visibleRequests = myRequests.filter(shouldShowItem);

    return (
        <div className="w-full">
            <PassengerActionModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
                actionType={actionModal.type}
                booking={actionModal.booking}
                onConfirm={handleConfirmAction}
            />

            <ReviewModal
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal({ ...reviewModal, isOpen: false })}
                booking={reviewModal.booking}
                onSubmit={handleReviewSubmit}
            />

            <OfferRideModal
                isOpen={offerModal.isOpen}
                onClose={() => setOfferModal({ isOpen: false, rideData: null })}
                authFetch={authFetch}
                API_URL={API_URL}
                onPublish={fetchData} // Refresh list on update/cancel
                initialData={offerModal.rideData}
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
                            {visibleRides.length === 0 ? (
                                <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                                    <p className="text-slate-500">No tienes viajes activos recientes.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2">
                                    {visibleRides.map(ride => (
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
                                                manageAction={() => handleEditRide(ride)}
                                                user={user}
                                            />
                                            {/* MATCHES DRAWER (DRIVER) */}
                                            {ride.matches_count > 0 && (
                                                <div className="bg-slate-900/80 rounded-xl p-4 mt-2 mb-6 border border-slate-700/50">
                                                    <button
                                                        onClick={() => setExpandedTicketId(expandedTicketId === ride.id ? null : ride.id)}
                                                        className="w-full text-center text-xs font-bold text-amber-400 uppercase tracking-widest hover:text-amber-300 transition mb-4 pb-2 border-b border-slate-700"
                                                    >
                                                        {expandedTicketId === ride.id ? '▼ Ocultar Candidatos' : `▶ Ver ${ride.matches_count} Pasajero(s)`}
                                                    </button>

                                                    {expandedTicketId === ride.id && (
                                                        <div className="space-y-4 animate-fadeIn">
                                                            {matches.filter(m => m.ride_id === ride.id).map((match, idx) => (
                                                                <div key={idx} className="scale-95 origin-top">
                                                                    <TicketCard
                                                                        type="match_found"
                                                                        data={match}
                                                                        user={user}
                                                                        onMatch={handleMatchAction}
                                                                        isDriver={true}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* BOOKINGS DRAWER (DRIVER - Paid Passengers) */}
                                            {ride.bookings_count > 0 && (
                                                <div className="bg-slate-900/80 rounded-xl p-4 mt-2 mb-6 border border-slate-700/50">
                                                    <button
                                                        onClick={() => toggleBookings(ride.id)}
                                                        className="w-full text-center text-xs font-bold text-green-400 uppercase tracking-widest hover:text-green-300 transition mb-4 pb-2 border-b border-slate-700"
                                                    >
                                                        {expandedBookingsId === ride.id ? '▼ Ocultar Reservas' : `▶ Ver ${ride.bookings_count} Reserva(s) Confirmada(s)`}
                                                    </button>

                                                    {expandedBookingsId === ride.id && (
                                                        <div className="space-y-4 animate-fadeIn">
                                                            {rideBookings[ride.id] ? rideBookings[ride.id].map((booking, idx) => (
                                                                <div key={idx} className="scale-95 origin-top">
                                                                    <TicketCard
                                                                        type="booking"
                                                                        data={booking}
                                                                        user={user}
                                                                        isDriver={true}
                                                                    />
                                                                </div>
                                                            )) : (
                                                                <div className="text-center py-4 text-slate-500 text-xs">Cargando...</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
                                {visibleBookings.length === 0 ? (
                                    <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                                        <p className="text-slate-500">No tienes reservas activas recientes.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {visibleBookings.map(booking => (
                                            <TicketCard
                                                key={booking.id}
                                                type="booking"
                                                data={booking}
                                                isManagement={false}
                                                onManage={(data) => handleActionRequest(data, 'cancel')}
                                                onReport={(data) => handleActionRequest(data, 'report')}
                                                onReview={(data) => setReviewModal({ isOpen: true, booking: data })}
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
                                {visibleRequests.length === 0 ? (
                                    <div className="text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                                        <p className="text-slate-500">No tienes solicitudes pendientes recientes.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {visibleRequests.map(req => (
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
                                                {/* MATCHES DRAWER (PASSENGER) */}
                                                {req.matches_count > 0 && (
                                                    <div className="bg-slate-900/80 rounded-xl p-4 mt-2 mb-6 border border-slate-700/50">
                                                        <button
                                                            onClick={() => setExpandedTicketId(expandedTicketId === req.id ? null : req.id)}
                                                            className="w-full text-center text-xs font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition mb-4 pb-2 border-b border-slate-700"
                                                        >
                                                            {expandedTicketId === req.id ? '▼ Ocultar Coincidencias' : `▶ Ver ${req.matches_count} Coincidencia(s)`}
                                                        </button>

                                                        {expandedTicketId === req.id && (
                                                            <div className="space-y-4 animate-fadeIn">
                                                                {matches.filter(m => m.request_id === req.id).map((match, idx) => (
                                                                    <div key={idx} className="scale-95 origin-top">
                                                                        <TicketCard
                                                                            type="match_found"
                                                                            data={match}
                                                                            user={user}
                                                                            onMatch={handleMatchAction}
                                                                            isDriver={false}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
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
