import { useState, useEffect, useRef } from 'react';

export default function CityAutocomplete({ label, value, onChange, placeholder = "Buscar ciudad..." }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Sync internal state if prop changes (external reset)
    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 3 && showSuggestions) {
                setIsLoading(true);
                try {
                    let raw = (import.meta.env.VITE_API_URL || 'https://api.yoviajo.com.ar').trim();
                    if (raw.endsWith('/')) { raw = raw.slice(0, -1); }
                    const API_URL = raw.endsWith('/api') ? raw : `${raw}/api`;
                    const res = await fetch(`${API_URL}/geocode/autocomplete?q=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSuggestions(data);
                    } else {
                        setSuggestions([]);
                    }
                } catch (error) {
                    console.error("Error fetching cities:", error);
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, showSuggestions]);

    const handleSelect = (item) => {
        setQuery(item.label);
        setShowSuggestions(false);
        // Propagate changes
        onChange(item.label, { lat: item.lat, lng: item.lng });
    };

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setShowSuggestions(true);
        // Propagate text change even if not selected
        onChange(val, null);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            {label && (
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleChange}
                    onFocus={() => query.length >= 3 && setShowSuggestions(true)}
                />
                {isLoading && (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {suggestions.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(item)}
                            className="p-3 text-sm text-slate-300 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 transition-colors"
                        >
                            <span className="block font-medium text-white">{item.label.split(',')[0]}</span>
                            <span className="text-xs text-slate-500">{item.label.split(',').slice(1).join(', ')}</span>
                        </li>
                    ))}
                </ul>
            )}

            {showSuggestions && query.length >= 3 && !isLoading && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-3 text-sm text-slate-500 text-center">
                    No se encontraron resultados
                </div>
            )}
        </div>
    );
}
