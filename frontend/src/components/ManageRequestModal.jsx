import { useState } from 'react'

export default function ManageRequestModal({ isOpen, onClose, requestData, authFetch, API_URL, onCancelRequest }) {
    const [loading, setLoading] = useState(false)

    if (!isOpen || !requestData) return null

    const handleCancelClick = async () => {
        if (!confirm("¿Estás seguro que deseas cancelar esta solicitud?")) return

        try {
            setLoading(true)
            const res = await authFetch(`${API_URL}/requests/${requestData.id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                alert("Solicitud cancelada correctamente.")
                if (onCancelRequest) onCancelRequest()
                onClose()
            } else {
                const error = await res.json()
                alert(`Error al cancelar: ${error.detail || 'Error desconocido'}`)
            }
        } catch (e) {
            alert("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-6 bg-slate-800/50 border-b border-slate-700 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Gestionar Solicitud</h3>
                        <span className="bg-pink-900/50 text-pink-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                            ID: {requestData.id}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-500 text-xs font-bold uppercase">Origen</span>
                            <span className="text-white font-bold">{requestData.origin}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-xs font-bold uppercase">Destino</span>
                            <span className="text-white font-bold">{requestData.destination}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-800 text-center">
                            <span className="text-slate-400 text-xs">Fecha Solicitada: </span>
                            <span className="text-white font-bold text-sm block">{requestData.date}</span>
                        </div>
                    </div>

                    <p className="text-slate-400 text-sm text-center">
                        ¿Ya encontraste viaje o cambiaste de planes? Puedes retirar tu solicitud aquí.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-900 border-t border-slate-800">
                    <button
                        onClick={handleCancelClick}
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-900/20 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                        {loading ? 'Cancelando...' : 'Cancelar Solicitud'}
                    </button>
                </div>

            </div>
        </div>
    )
}
