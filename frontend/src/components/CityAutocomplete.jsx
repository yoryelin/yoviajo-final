import { useState, useEffect, useRef } from 'react';
import citiesData from '../data/argentina_cities.json';

export default function CityAutocomplete({ label, value, onChange, placeholder = "Buscar ciudad..." }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
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

    // Local Search Logic (No more API calls!)
    useEffect(() => {
        // Only search if user has typed at least 2 characters (faster feedback than 3)
        if (query.length >= 2 && showSuggestions) {
            const lowerQuery = query.toLowerCase();

            const filtered = citiesData.filter(city =>
                city.label.toLowerCase().includes(lowerQuery)
            ).slice(0, 8); // Limit to top 8 results for cleaner UI

            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [query, showSuggestions]);

    const handleSelect = (item) => {
        setQuery(item.label);
        setShowSuggestions(false);
        // Propagate changes with standardized data
        onChange(item.label, { lat: item.lat, lng: item.lng });
    };

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setShowSuggestions(true);
        // Propagate text change even if not selected (allows soft selection or custom input if needed later)
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
                    onFocus={() => {
                        if (query.length >= 1) setShowSuggestions(true);
                        // Optional: Show popular cities if empty? For now, keep it simple.
                    }}
                />
                <div className="absolute right-3 top-3 text-slate-600 pointer-events-none">
                    🔍
                </div>
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {suggestions.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(item)}
                            className="p-3 text-sm text-slate-300 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 transition-colors flex justify-between items-center"
                        >
                            <span className="font-medium text-white">{item.label.split(',')[0]}</span>
                            <span className="text-xs text-slate-500">{item.label.split(',')[1]}</span>
                        </li>
                    ))}
                </ul>
            )}

            {showSuggestions && query.length >= 3 && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-3 text-sm text-slate-500 text-center">
                    <p>No encontramos esa ciudad.</p>
                    <p className="text-xs mt-1">Prueba con una más grande cerca.</p>
                </div>
            )}
        </div>
    );
}
