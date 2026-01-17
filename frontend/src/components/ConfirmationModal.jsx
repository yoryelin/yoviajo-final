
import React from 'react'

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, warning, confirmText = 'Confirmar', isDanger = false }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-up">

                {/* Header */}
                <div className={`p-4 border-b ${isDanger ? 'bg-red-900/20 border-red-500/30' : 'bg-slate-800 border-slate-700'} flex items-center gap-3`}>
                    <div className={`p-2 rounded-full ${isDanger ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                        {isDanger ? '⚠️' : 'ℹ️'}
                    </div>
                    <h3 className="font-bold text-white text-lg">{title}</h3>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {message}
                    </p>

                    {warning && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex gap-3 items-start">
                            <span className="text-xl">⚖️</span>
                            <div>
                                <p className="text-yellow-200 text-xs font-bold uppercase mb-1">Impacto en Reputación</p>
                                <p className="text-yellow-100/80 text-xs">{warning}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-950/50 p-4 border-t border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-400 text-sm font-bold hover:text-white transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-white text-sm font-bold shadow-lg transition transform active:scale-95 ${isDanger ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                        {confirmText}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default ConfirmationModal
