import { useState, useEffect } from 'react'
import CityAutocomplete from './CityAutocomplete'
import { useAuth } from '../context/AuthContext'
import ConfirmationModal from './ConfirmationModal'

// Haversine Formula for distance estimation (straight line * road factor)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDist = R * c;
    return Math.round(straightDist * 1.3); // 1.3 approximate road factor
}

const OfferRideModal = ({ isOpen, onClose, authFetch, API_URL, onPublish, initialData }) => {
    const { user } = useAuth()
    const userIsFemale = user?.gender === 'F'

    const [offer, setOffer] = useState({
        origin: '',
        destination: '',
        date: '',
        time_start: '08:00',
        time_end: '10:00',
        price: '',
        available_seats: 4, // Default seats
        origin_lat: null,
        origin_lng: null,
        destination_lat: null,
        destination_lng: null
    })

    const [showCancelModal, setShowCancelModal] = useState(false)

    // Date Constraints (Local Timezone Fix)
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);

    const today = localISOTime;
    const maxDate = new Date(Date.now() - tzOffset + 72 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Pre-fill Magic
    useEffect(() => {
        if (initialData) {
            setOffer({
                origin: initialData.origin || '',
                destination: initialData.destination || '',
                date: initialData.date || initialData.departure_time?.split('T')[0] || '',
                time_start: initialData.time_window_start || initialData.departure_time?.split('T')[1]?.slice(0, 5) || '08:00',
                time_end: initialData.time_window_end || '10:00',
                price: initialData.price || initialData.proposed_price || '',
                origin_lat: initialData.origin_lat || null,
                origin_lng: initialData.origin_lng || null,
                destination_lat: initialData.destination_lat || null,
                destination_lng: initialData.destination_lng || null,
                women_only: initialData.women_only || false,
                fuel_liters: initialData.fuel_liters_total || (initialData.price ? initialData.price / 1750 * 4 : 0),
                available_seats: initialData.available_seats || 4
            })
        } else {
            // Reset if no initial data
            setOffer({ origin: '', destination: '', date: '', time_start: '08:00', time_end: '10:00', price: '', available_seats: 4, origin_lat: null, origin_lng: null, destination_lat: null, destination_lng: null })
        }
    }, [initialData, isOpen])

    // Auto-calculate distance
    useEffect(() => {
        if (offer.origin_lat && offer.origin_lng && offer.destination_lat && offer.destination_lng) {
            const dist = calculateDistance(offer.origin_lat, offer.origin_lng, offer.destination_lat, offer.destination_lng);
            const totalLiters = dist / 10;
            // Only update if distance hasn't been manually set or looks like an auto-calc update
            setOffer(prev => ({
                ...prev,
                distance: dist,
                fuel_liters: totalLiters,
                price: (dist * 175)
            }));
        }
    }, [offer.origin_lat, offer.origin_lng, offer.destination_lat, offer.destination_lng]);

    // DEBUG: Validate URL on mount
    useEffect(() => {
        if (isOpen) {
            console.log("OfferRideModal Open. API_URL:", API_URL);
        }
    }, [isOpen])

    // Handlers para el form
    const handleChange = (e) => setOffer({ ...offer, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await authFetch(`${API_URL}/rides`, {
                method: 'POST',
                body: JSON.stringify({
                    ...offer,
                    departure_time: `${offer.date}T${offer.time_start}`,
                    price: parseInt(offer.price),
                    available_seats: parseInt(offer.available_seats)
                })
            })

            if (response.ok) {
                alert("¡Viaje Publicado!")
                setOffer({ origin: '', destination: '', date: '', time_start: '08:00', time_end: '10:00', price: '', available_seats: 4 })

                console.log("Success! Calling callbacks...");
                if (typeof onPublish === 'function') {
                    await onPublish();
                } else {
                    console.error("onPublish is not a function:", onPublish);
                }

                if (typeof onClose === 'function') {
                    onClose();
                } else {
                    console.error("onClose is not a function:", onClose);
                }
            } else {
                const error = await response.json()
                alert(error.detail || "Error al publicar")
            }
        } catch (e) {
            console.error("Error creating ride:", e);
            alert(`DEBUG ERROR: ${e.name} - ${e.message}. URL: ${API_URL}/rides`);
        }
    }

    const handleCancelRide = async () => {
        if (!initialData?.id) return

        try {
            const response = await authFetch(`${API_URL}/rides/${initialData.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                const data = await response.json()
                alert(data.message)
                setShowCancelModal(false)
                onPublish() // Refresh list
                onClose() // Close modal
            } else {
                const error = await response.json()
                alert(error.detail || "Error al cancelar")
            }
        } catch (e) {
            console.error("Error cancelling ride:", e);
            alert(`Error inesperado: ${e.message || "Error desconocido"}`);
        }
    }

    // Calcular Penalización para Warning
    const getPenaltyWarning = () => {
        if (!initialData?.departure_time) return null

        const dep = new Date(initialData.departure_time)
        const now = new Date()
        const diffHours = (dep - now) / (1000 * 60 * 60)

        if (diffHours < 24) {
            return "Estás cancelando con menos de 24hs de anticipación. Se te descontarán 20 Puntos de Reputación."
        }
        return "Faltan más de 24hs. No habrá penalización."
    }

    if (!isOpen) return null

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                {/* Container */}
                <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-cyan-900/40 to-slate-900/40 p-4 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <span className="text-cyan-400 text-2xl">🚗</span> {initialData ? 'Gestionar Viaje' : 'Publicar Oferta'}
                        </h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* ... (Existing Fields) ... */}
                            <div className="flex gap-3">
                                <div className="w-1/2">
                                    <CityAutocomplete
                                        label="Origen"
                                        placeholder="Ej: Córdoba"
                                        value={offer.origin}
                                        onChange={(val, coords) => setOffer(prev => ({
                                            ...prev,
                                            origin: val,
                                            origin_lat: coords ? coords.lat : prev.origin_lat,
                                            origin_lng: coords ? coords.lng : prev.origin_lng
                                        }))}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <CityAutocomplete
                                        label="Destino"
                                        placeholder="Ej: Carlos Paz"
                                        value={offer.destination}
                                        onChange={(val, coords) => setOffer(prev => ({
                                            ...prev,
                                            destination: val,
                                            destination_lat: coords ? coords.lat : prev.destination_lat,
                                            destination_lng: coords ? coords.lng : prev.destination_lng
                                        }))}
                                    />
                                </div>
                            </div>



                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ref. Origen (Ej: Casino)</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white transition placeholder-slate-600"
                                        name="origin_reference"
                                        placeholder="Punto exacto de salida..."
                                        value={offer.origin_reference || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ref. Destino (Ej: Plaza)</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white transition placeholder-slate-600"
                                        name="destination_reference"
                                        placeholder="Punto exacto de llegada..."
                                        value={offer.destination_reference || ''}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Fecha de Salida</label>
                                <input
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white transition [color-scheme:dark]"
                                    name="date"
                                    onChange={handleChange}
                                    required
                                    type="date"
                                    min={today}
                                    max={maxDate}
                                    value={offer.date}
                                />
                                <p className="text-[10px] text-yellow-500/80 mt-1 font-medium">⚠️ Solo viajes dentro de las próximas 72 horas.</p>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-1/2">
                                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1 block">Hora Salida (Desde)</label>
                                    <input className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white transition [color-scheme:dark]" name="time_start" onChange={handleChange} required type="time" value={offer.time_start} />
                                </div>
                                <div className="w-1/2">
                                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1 block">Hora Limite (Hasta)</label>
                                    <input className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white transition [color-scheme:dark]" name="time_end" onChange={handleChange} required type="time" value={offer.time_end} />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-1/3">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Asientos Disp.</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white transition text-center font-bold"
                                        name="available_seats"
                                        onChange={handleChange}
                                        required
                                        type="number"
                                        min="1"
                                        max="8"
                                        value={offer.available_seats}
                                    />
                                </div>
                                <div className="w-2/3">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Distancia (km)</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white transition placeholder-slate-600"
                                        name="price"
                                        onChange={(e) => {
                                            const dist = parseFloat(e.target.value);
                                            const totalLiters = dist / 10;
                                            setOffer({ ...offer, distance: dist, fuel_liters: totalLiters, price: (dist * 175) });
                                        }}
                                        placeholder="Ej: 400"
                                        required
                                        type="number"
                                        value={offer.distance || ''}
                                    />
                                </div>
                            </div>

                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-3 flex flex-col justify-center border border-dashed border-slate-700">
                        <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1 block">Consumo Estimado Total</label>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl">⛽</span>
                            <span className="text-2xl font-black text-white">
                                {offer.fuel_liters ? Math.round(offer.fuel_liters) : '-'} L
                            </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                            Referencia Total para el viaje ({offer.distance || '-'} km)
                        </div>
                    </div>

                    {/* WOMEN ONLY TOGGLE */}
                    {userIsFemale && (
                        <div className="bg-pink-900/10 border border-pink-500/20 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-pink-500/20 p-2 rounded-lg">
                                    🌸
                                </div>
                                <div>
                                    <p className="text-pink-200 text-xs font-bold uppercase">Solo Mujeres</p>
                                    <p className="text-[10px] text-pink-400/70">Viaje exclusivo para pasajeras</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={offer.women_only || false}
                                    onChange={(e) => setOffer({ ...offer, women_only: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-800 border border-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600 peer-checked:border-pink-500"></div>
                            </label>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex gap-3 pt-2">
                        {/* Only show Cancel if initialData exists (Manage Mode) */}
                        {initialData && (
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(true)}
                                className="flex-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 font-bold py-4 rounded-xl shadow-lg transition transform active:scale-[0.98] text-sm uppercase tracking-widest"
                            >
                                Cancelar Viaje
                            </button>
                        )}

                        <button
                            type="submit"
                            className="flex-[2] bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-cyan-900/20 transition transform active:scale-[0.98] text-sm uppercase tracking-widest"
                        >
                            {initialData ? 'GUARDAR CAMBIOS' : 'CONFIRMAR PUBLICACIÓN'}
                        </button>
                    </div>
                </form>
            </div>

        </div >
            </div >

    {/* CONFIRMATION MODAL */ }
    < ConfirmationModal
isOpen = { showCancelModal }
onClose = {() => setShowCancelModal(false)}
onConfirm = { handleCancelRide }
title = "¿Cancelar este viaje?"
message = "Esta acción cancelará todos los lugares reservados y notificará a los pasajeros."
warning = { initialData? getPenaltyWarning(): null }
confirmText = "Sí, Cancelar Viaje"
isDanger = { true}
    />
        </>
    )
}

export default OfferRideModal
