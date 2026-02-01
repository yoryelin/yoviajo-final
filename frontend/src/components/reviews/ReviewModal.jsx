import React, { useState } from 'react';
import StarRating from '../common/StarRating';
import { X, MessageSquare } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, onSubmit, booking }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen || !booking) return null;

    const handleSubmit = async () => {
        if (rating === 0) return alert("Por favor selecciona una calificación.");

        setLoading(true);
        try {
            await onSubmit({
                booking_id: booking.id,
                rating,
                comment
            });
            onClose();
        } catch (error) {
            console.error("Review submit error:", error);
            alert("Error al enviar la reseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden animate-zoom-in">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-yellow-400">★</span> Calificar Viaje
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center gap-6">
                    <div className="text-center">
                        <p className="text-slate-400 text-sm mb-1">¿Cómo estuvo tu experiencia con?</p>
                        <h4 className="text-xl font-bold text-white">
                            {booking.other_party_name || "El usuario"}
                        </h4>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <StarRating
                            rating={rating}
                            onChange={setRating}
                            size={32}
                        />
                    </div>

                    <div className="w-full">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                            Comentario (Opcional)
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute top-3 left-3 text-slate-500" size={16} />
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Escribe aquí tu opinión..."
                                className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-cyan-500/50 placeholder:text-slate-600 resize-none h-24"
                            />
                        </div>
                    </div>

                    <div className="w-full flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || rating === 0}
                            className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-900/20"
                        >
                            {loading ? "Enviando..." : "Enviar Reseña"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
