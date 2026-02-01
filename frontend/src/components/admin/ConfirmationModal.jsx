import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isDangerous = false
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isDangerous ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                            }`}>
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
                        </div>
                    </div>

                    <p className="text-slate-300 mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-4 py-2 text-white rounded-lg shadow-lg font-bold transition-transform active:scale-95 ${isDangerous
                                    ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
