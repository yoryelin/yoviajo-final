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
    const [selectedRideForEdit, setSelectedRideForEdit] = useState(null) // NEW: For managing
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [showReserveModal, setShowReserveModal] = useState(false)
    const [selectedRideForReservation, setSelectedRideForReservation] = useState(null)
    const [loading, setLoading] = useState(false)

    // ... (rest of search filters) ...

    // Handle Manage (Driver)
    const handleManageRide = (rideData) => {
        setSelectedRideForEdit(rideData)
        setShowOfferModal(true)
    }

    // Handle Reserve
    const handleReserveInit = (rideData) => {
        setSelectedRideForReservation(rideData)
        setShowReserveModal(true)
    }

    // ... (useEffect and styles) ...

    return (
        <>
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
        </>
    )
}
