import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom' // Added useNavigate
import { useAuth } from '../context/AuthContext'
import OfferRideModal from '../components/OfferRideModal'
import RequestRideModal from '../components/RequestRideModal'
import TicketCard from '../components/TicketCard'
import CityAutocomplete from '../components/CityAutocomplete'
import ReserveRideModal from '../components/ReserveRideModal'
import PaymentModal from '../components/PaymentModal'

export default function Dashboard() {
    const { user, authFetch } = useAuth()
    const navigate = useNavigate() // Hook
    const isDriver = user?.role === 'C'

    // Check for Intended Role Redirect (From Landing)
    useEffect(() => {
        const intended = sessionStorage.getItem('intendedRole')
        if (intended) {
            sessionStorage.removeItem('intendedRole')
            if (intended === 'C' && !isDriver) {
                // User wanted to be Driver but is Passenger
                // Redirect to Profile to upgrade
                if (confirm("Para publicar viajes, primero debes configurar tu perfil de Conductor. ¿Ir al perfil?")) {
                    navigate('/profile')
                }
            }
        }
    }, [isDriver, navigate])

    // Normalizar URL: asegurar que termine en /api
    const RAW_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8003'
    const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`

    // Datos y Estados
    const [rides, setRides] = useState([])
    const [requests, setRequests] = useState([])
    const [matches, setMatches] = useState([]) // NEW: Smart Matches
    const [loading, setLoading] = useState(false) // Moved up context logic check

    // Search State
    const [searchFrom, setSearchFrom] = useState('')
    const [searchTo, setSearchTo] = useState('')
    const [searchDate, setSearchDate] = useState('')

    // UI State
    const [activeTab, setActiveTab] = useState('rides')

    // Modals
    const [showOfferModal, setShowOfferModal] = useState(false)
    const [selectedRideForEdit, setSelectedRideForEdit] = useState(null)
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [showReserveModal, setShowReserveModal] = useState(false)
    const [selectedRideForReservation, setSelectedRideForReservation] = useState(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [currentBookingForPayment, setCurrentBookingForPayment] = useState(null)

    useEffect(() => {
        fetchData()
    }, [user])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch Rides
            const resRides = await authFetch(`${API_URL}/rides`)
            if (resRides.ok) setRides(await resRides.json())

            // Fetch Requests (if needed, or logic to separate)
            const resRequests = await authFetch(`${API_URL}/requests`)
            if (resRequests.ok) setRequests(await resRequests.json())

            // Fetch Matches
            const resMatches = await authFetch(`${API_URL}/matches`)
            if (resMatches.ok) setMatches(await resMatches.json())
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Filter Logic
    const filteredRides = rides.filter(ride => {
        if (searchFrom && !ride.origin.toLowerCase().includes(searchFrom.toLowerCase())) return false
        if (searchTo && !ride.destination.toLowerCase().includes(searchTo.toLowerCase())) return false
        if (searchDate && ride.departure_time && !ride.departure_time.startsWith(searchDate)) return false
        return true
    })

    const filteredRequests = requests.filter(req => {
        if (searchFrom && !req.origin.toLowerCase().includes(searchFrom.toLowerCase())) return false
        if (searchTo && !req.destination.toLowerCase().includes(searchTo.toLowerCase())) return false
        return true
    })

    // Handle Manage (Driver)
    const handleManageRide = (rideData) => {
        setSelectedRideForEdit(rideData)
        setShowOfferModal(true)
    }

    const handleReserveInit = (rideData) => {
        setSelectedRideForReservation(rideData)
        setShowReserveModal(true)
    }

    const handleMatch = async (matchData) => {
        // Lógica para "Solicitar Unirme" (Pasajero)
        if (!isDriver) {
            if (confirm(`¿Confirmar reserva con ${matchData.candidate_user.name}? Se procederá al pago del Fee.`)) {
                setLoading(true)
                try {
                    // 1. Crear Reserva (Awaiting Payment)
                    const res = await authFetch(`${API_URL}/bookings/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ride_id: matchData.ride_id,
                            seats_booked: 1 // Default 1 seat for match
                        })
                    })
                    if (res.ok) {
                        const booking = await res.json()

                        // 2. Redirigir a MercadoPago (Real Payment)
                        if (booking.payment_init_point) {
                            window.location.href = booking.payment_init_point
                        } else {
                            // Fallback (Simulation)
                            setCurrentBookingForPayment(booking)
                            setShowPaymentModal(true)
                        }
                    } else {
                        const err = await res.json()
                        alert(`Error: ${err.detail}`)
                    }
                } catch (e) {
                    console.error(e)
                    alert("Error al iniciar reserva")
                } finally {
                    setLoading(false)
                }
            }
        } else {
            alert("La funcionalidad para invitar pasajeros estará disponible pronto.")
        }
    }

    return (
        <>
            <div className="space-y-6">
                {/* --- SMART MATCHES SECTION --- */}
                {matches.length > 0 && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-amber-900/40 to-slate-900 rounded-3xl border border-amber-500/30 animate-pulse-glow">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🎯</span>
                            <div>
                                <h3 className="text-xl font-bold text-amber-500">Coincidencias Inteligentes</h3>
                                <p className="text-xs text-amber-200/70">Usuarios compatibles contigo (Mismo trayecto + Horario similar)</p>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {matches.map((match, idx) => (
                                <TicketCard
                                    key={`match-${idx}`}
                                    type="match_found"
                                    data={match}
                                    user={user}

                                    onMatch={handleMatch}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* --- FEED DE VIAJES --- */}
                {activeTab === 'rides' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                                <span>🔍</span> Explorar Viajes
                            </h3>
                            <span className="text-xs font-bold text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
                                {filteredRides.length} Resultados
                            </span>
                        </div>

                        {filteredRides.length === 0 ? (
                            <div className="text-center p-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                                <p className="text-slate-500 font-medium">No se encontraron viajes con esos criterios.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredRides.map(ride => (
                                    <TicketCard
                                        key={ride.id}
                                        type="ride"
                                        data={ride}
                                        user={user}
                                        onReserve={handleReserveInit}
                                        onManage={handleManageRide} // NEW: Pass handler
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- FEED DE SOLICITUDES --- */}
                {activeTab === 'requests' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-pink-400 flex items-center gap-2">
                                <span>🙋‍♂️</span> Solicitudes de Pasajeros
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
                                    {filteredRequests.length} Solicitudes
                                </span>
                            </div>
                        </div>

                        {filteredRequests.length === 0 ? (
                            <div className="text-center p-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                                <p className="text-slate-500 font-medium">No hay pasajeros buscando viajes por ahora.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredRequests.map(req => (
                                    <TicketCard
                                        key={req.id}
                                        type="request"
                                        data={req}
                                        user={user}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* FAB */}
            <div className="fixed bottom-8 right-8 z-30">
                {isDriver ? (
                    <button
                        onClick={() => { setSelectedRideForEdit(null); setShowOfferModal(true); }} // Reset for new
                        className="group flex items-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 px-6 rounded-full shadow-2xl shadow-cyan-900/50 transition-all hover:scale-105 active:scale-95 animate-bounce-pin"
                    >
                        <span className="text-2xl">➕</span>
                        <span className="uppercase tracking-widest text-sm hidden group-hover:inline-block transition-all">Publicar</span>
                    </button>
                ) : (
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className="group flex items-center gap-3 bg-pink-600 hover:bg-pink-500 text-white font-black py-4 px-6 rounded-full shadow-2xl shadow-pink-900/50 transition-all hover:scale-105 active:scale-95 animate-bounce-pin"
                    >
                        <span className="text-2xl">➕</span>
                        <span className="uppercase tracking-widest text-sm hidden group-hover:inline-block transition-all">Solicitar</span>
                    </button>
                )}
            </div>

            {/* MODALS */}
            <OfferRideModal
                isOpen={showOfferModal}
                onClose={() => { setShowOfferModal(false); setSelectedRideForEdit(null); }}
                authFetch={authFetch}
                API_URL={API_URL}
                onPublish={fetchData}
                initialData={selectedRideForEdit} // NEW: Pass data
            />
            <RequestRideModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} authFetch={authFetch} API_URL={API_URL} onPublish={fetchData} />
            <ReserveRideModal isOpen={showReserveModal} ride={selectedRideForReservation} onClose={() => { setShowReserveModal(false); setSelectedRideForReservation(null) }} authFetch={authFetch} API_URL={API_URL} onReserveSuccess={fetchData} />
            <PaymentModal
                booking={currentBookingForPayment}
                onClose={() => { setShowPaymentModal(false); setCurrentBookingForPayment(null); }}
                onPaymentSuccess={(data) => {
                    setShowPaymentModal(false)
                    setCurrentBookingForPayment(null)
                    fetchData() // Refresh to show confirmed booking/ticket
                    alert("¡Reserva Confirmada! Datos del conductor desbloqueados.")
                }}
                authFetch={authFetch}
                API_URL={API_URL}
            />
        </>
    )
}
