import { useState, useEffect } from 'react'
import CityAutocomplete from './CityAutocomplete'


const OfferRideModal = ({ isOpen, onClose, authFetch, API_URL, onPublish, initialData }) => {
    const [offer, setOffer] = useState({
        origin: '',
        destination: '',
        date: '',
        time_start: '08:00',
        time_end: '10:00',
        price: '',
        origin_lat: null,
        origin_lng: null,
        destination_lat: null,
        destination_lng: null
    })

    // Date Constraints
    const today = new Date().toISOString().split('T')[0]
    const maxDate = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Pre-fill Magic
    useEffect(() => {
        if (initialData) {
            setOffer({
                origin: initialData.origin || '',
                destination: initialData.destination || '',
                date: initialData.date || '',
                time_start: initialData.time_window_start || '08:00',
                time_end: initialData.time_window_end || '10:00',
                price: initialData.proposed_price || '',
                origin_lat: initialData.origin_lat || null,
                origin_lng: initialData.origin_lng || null,
                destination_lat: initialData.destination_lat || null,
                destination_lng: initialData.destination_lng || null
            })
        } else {
            // Reset if no initial data
            setOffer({ origin: '', destination: '', date: '', time_start: '08:00', time_end: '10:00', price: '', origin_lat: null, origin_lng: null, destination_lat: null, destination_lng: null })
        }
    }, [initialData, isOpen])

    // Handlers para el form
    const handleChange = (e) => setOffer({ ...offer, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await authFetch(`${API_URL}/rides/`, {
                method: 'POST',
                body: JSON.stringify({
                    ...offer,
                    departure_time: `${offer.date}T${offer.time_start}`,
                    price: parseInt(offer.price),
                    available_seats: 4
                })
            })

            if (response.ok) {
                alert("¡Viaje Publicado!")
                setOffer({ origin: '', destination: '', date: '', time_start: '08:00', time_end: '10:00', price: '' })
                onPublish()
                onClose()
            } else {
                const error = await response.json()
                alert(error.detail || "Error al publicar")
            }
        } catch (e) {
            alert("Error de conexión")
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            {/* Container */}
            <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-900/40 to-slate-900/40 p-4 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <span className="text-cyan-400 text-2xl">🚗</span> Publicar Oferta
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form className="space-y-5" onSubmit={handleSubmit}>
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

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Precio por Asiento</label>
                            <input className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white transition placeholder-slate-600" name="price" onChange={handleChange} placeholder="$ 0" required type="number" value={offer.price} />
                        </div>

                        <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-cyan-900/20 transition transform active:scale-[0.98] text-sm uppercase tracking-widest mt-2">
                            CONFIRMAR PUBLICACIÓN
                        </button>
                    </form>
                </div>

            </div>
        </div>
    )
}

export default OfferRideModal
