import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Check, X, Navigation } from 'lucide-react';
import { API_URL } from '@config/api.js';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle clicks on map
function MapUpdater({ center, onClick }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom());
        }
    }, [center, map]);

    useMapEvents({
        click(e) {
            onClick(e.latlng);
        },
    });

    return null;
}

export default function LocationPicker({ isOpen, onClose, onConfirm, initialAddress = "", initialLat, initialLng }) {
    // Default Center: Buenos Aires Obelisco
    const DEFAULT_CENTER = [-34.603722, -58.381592];

    const [center, setCenter] = useState(initialLat && initialLng ? [initialLat, initialLng] : DEFAULT_CENTER);
    const [markerPos, setMarkerPos] = useState(initialLat && initialLng ? [initialLat, initialLng] : DEFAULT_CENTER);
    const [address, setAddress] = useState(initialAddress);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialLat && initialLng) {
                const pos = [initialLat, initialLng];
                setCenter(pos);
                setMarkerPos(pos);
            }
            setAddress(initialAddress);
            setSearchQuery("");
            setSearchResults([]);
        }
    }, [isOpen, initialAddress, initialLat, initialLng]);

    if (!isOpen) return null;

    // Search Autocomplete
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/geocode/autocomplete?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    const selectSearchResult = (result) => {
        const pos = [result.lat, result.lng];
        setCenter(pos);
        setMarkerPos(pos);
        setAddress(result.label); // Or result.value
        setSearchQuery("");
        setSearchResults([]);
    };

    // Handle Map Click (Reverse Geocode)
    const handleMapClick = async (latlng) => {
        setMarkerPos([latlng.lat, latlng.lng]);
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/geocode/reverse?lat=${latlng.lat}&lng=${latlng.lng}`);
            if (res.ok) {
                const data = await res.json();
                setAddress(data.display_name);
            } else {
                setAddress("Ubicación seleccionada");
            }
        } catch (error) {
            console.error("Reverse geocode error:", error);
            setAddress("Error obteniendo dirección");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        onConfirm({
            address,
            lat: markerPos[0],
            lng: markerPos[1]
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden relative">

                {/* Header / Search Bar */}
                <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex gap-2 items-center z-[1000] relative">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Buscar ciudad o calle..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                                {searchResults.map((res, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => selectSearchResult(res)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-800 border-b border-slate-800/50 last:border-0 transition"
                                    >
                                        <p className="text-sm font-bold text-white truncate">{res.label}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative bg-slate-800">
                    <MapContainer
                        center={center}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={markerPos} />
                        <MapUpdater center={center} onClick={handleMapClick} />
                    </MapContainer>

                    {/* Quick Address Display */}
                    <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl z-[900] flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-3 overflow-hidden w-full">
                            <div className="min-w-10 h-10 rounded-full bg-cyan-900/30 flex items-center justify-center border border-cyan-500/30">
                                <MapPin className="text-cyan-400" size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Ubicación Seleccionada</p>
                                <p className="text-sm font-bold text-white truncate">{loading ? "Cargando..." : (address || "Selecciona un punto en el mapa")}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleConfirm}
                            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-xl shadow-lg shadow-cyan-900/20 active:scale-95 transition flex items-center justify-center gap-2"
                        >
                            <Check size={18} strokeWidth={3} />
                            CONFIRMAR
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
