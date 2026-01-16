import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import OfferRideModal from '../components/OfferRideModal'
import RequestRideModal from '../components/RequestRideModal'
import TicketCard from '../components/TicketCard'
import CityAutocomplete from '../components/CityAutocomplete'
import ReserveRideModal from '../components/ReserveRideModal'

export default function Dashboard() {
    const { user } = useAuth()

    // Normalizar URL: asegurar que termine en /api
    const RAW_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8003'
    const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`

    // Datos y Estados
    const [rides, setRides] = useState([])
    const [requests, setRequests] = useState([])

    // UI State
    const [activeTab, setActiveTab] = useState('rides') // 'rides' | 'requests'

    // Modals
    const [showOfferModal, setShowOfferModal] = useState(false)
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [showReserveModal, setShowReserveModal] = useState(false)
    const [selectedRideForReservation, setSelectedRideForReservation] = useState(null)
    const [loading, setLoading] = useState(false)

    // Search Filters
    const [searchTerm, setSearchTerm] = useState({ origin: '', destination: '' })

    // Detectar Rol Activo
    const userRole = user?.role
    const isDriver = userRole === 'C'

    // Función para hacer fetch autenticado
    const authFetch = async (url, options = {}) => {
        const token = localStorage.getItem('token')
        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        })
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            // Public Feeds
            const resRides = await authFetch(`${API_URL}/rides/`)
            if (resRides.ok) setRides(await resRides.json())

            const resRequests = await authFetch(`${API_URL}/requests/`)
            if (resRequests.ok) setRequests(await resRequests.json())
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Filter Logic
    const filterList = (list) => {
        return list.filter(item => {
            const matchOrigin = item.origin.toLowerCase().includes(searchTerm.origin.toLowerCase())
            const matchDest = item.destination.toLowerCase().includes(searchTerm.destination.toLowerCase())
            return matchOrigin && matchDest
        })
    }

    // Derived lists
    const filteredRides = filterList(rides)
    const filteredRequests = filterList(requests)

    // Handle Reserve
    const handleReserveInit = (rideData) => {
        setSelectedRideForReservation(rideData)
        setShowReserveModal(true)
    }

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user])

    // --- ANIMACIONES CSS (Inyectadas) ---
    const styles = `
    @keyframes wave {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .animate-wave { animation: wave 2s ease-in-out infinite; }
    
    @keyframes bounce-pin {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-bounce-pin { animation: bounce-pin 2s ease-in-out infinite; }
    
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
  `

    return (
        <>
            <style>{styles}</style>

            {/* SEARCH BAR */}
            <div className="mb-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <CityAutocomplete
                        label="Filtrar Origen"
                        placeholder="Ej: Mar del Plata"
                        value={searchTerm.origin}
                        onChange={(val) => setSearchTerm({ ...searchTerm, origin: val })}
                    />
                </div>
                <div className="flex-1">
                    <CityAutocomplete
                        label="Filtrar Destino"
                        placeholder="Ej: Necochea"
                        value={searchTerm.destination}
                        onChange={(val) => setSearchTerm({ ...searchTerm, destination: val })}
                    />
                </div>
            </div>

            {/* TABS (Simplified) */}
            <div className="flex bg-slate-900/50 p-1 rounded-xl mb-8 border border-white/5 w-fit">
                <button
                    onClick={() => setActiveTab('rides')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'rides' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-slate-400 hover:text-white'}`}
                >
                    Buscar Viajes
                </button>

                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/50' : 'text-slate-400 hover:text-white'}`}
                >
                    Ver Solicitudes
                </button>
            </div>

            <div className="space-y-6">
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
                                        onReserve={handleReserveInit}
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
                        onClick={() => setShowOfferModal(true)}
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
            {/* Note: OfferModal still needs simple management call or it can stay here for Creation */}
            <OfferRideModal isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} authFetch={authFetch} API_URL={API_URL} onPublish={fetchData} />
            <RequestRideModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} authFetch={authFetch} API_URL={API_URL} onPublish={fetchData} />
            <ReserveRideModal isOpen={showReserveModal} ride={selectedRideForReservation} onClose={() => { setShowReserveModal(false); setSelectedRideForReservation(null) }} authFetch={authFetch} API_URL={API_URL} onReserveSuccess={fetchData} />
        </>
    )
}
