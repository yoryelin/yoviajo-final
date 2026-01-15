
import { useState, useEffect } from 'react'

export default function PassengerActionModal({ isOpen, onClose, actionType, booking, onConfirm }) {
    // actionType: 'cancel' | 'report'

    if (!isOpen || !booking) return null

    const isCancel = actionType === 'cancel'
    const isReport = actionType === 'report'

    // Calculate Penalty for display
    const getPenaltyInfo = () => {
        if (!booking.ride_departure_time && !booking.ride?.departure_time) return { isPenalty: false, hours: 99 }

        const depTimeStr = booking.ride_departure_time || booking.ride?.departure_time
        const now = new Date()
        const departure = new Date(depTimeStr)
        const diffHours = (departure - now) / (1000 * 60 * 60)

        return {
            isPenalty: diffHours < 6 && diffHours > 0, // Penalty if < 6h (and not past)
            hours: diffHours
        }
    }

    const { isPenalty } = getPenaltyInfo()

    const handleConfirm = () => {
        onConfirm(booking, actionType)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                <div className={`p-6 border-b ${isCancel ? 'bg-red-900/10 border-red-900/30' : 'bg-orange-900/10 border-orange-900/30'}`}>
                    <h3 className={`text-xl font-bold ${isCancel ? 'text-red-400' : 'text-orange-400'}`}>
                        {isCancel ? 'Cancelar Reserva' : 'Reportar Ausencia'}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                        {isCancel
                            ? '¿Estás seguro de que deseas cancelar tu lugar?'
                            : '¿Deseas reportar que el conductor no se presentó?'}
                    </p>
                </div>

                <div className="p-6">
                    {/* CANCEL WARNINGS */}
                    {isCancel && (
                        <div className={`rounded-xl p-4 border ${isPenalty ? 'bg-red-950/50 border-red-900/50' : 'bg-green-950/50 border-green-900/50'}`}>
                            <div className="flex gap-3">
                                <span className="text-2xl">{isPenalty ? '⚠️' : '✅'}</span>
                                <div>
                                    <h4 className={`font-bold text-sm ${isPenalty ? 'text-red-300' : 'text-green-300'}`}>
                                        {isPenalty ? 'Penalización Aplicable' : 'Sin Penalización'}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        {isPenalty
                                            ? 'Faltan menos de 6 horas para el viaje. Si cancelas ahora, se te descontarán 5 puntos de reputación.'
                                            : 'Faltan más de 6 horas. Puedes cancelar gratuitamente sin afectar tu reputación.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REPORT INFO */}
                    {isReport && (
                        <div className="rounded-xl p-4 border bg-orange-950/50 border-orange-900/50">
                            <div className="flex gap-3">
                                <span className="text-2xl">⚖️</span>
                                <div>
                                    <h4 className="font-bold text-sm text-orange-300">
                                        Acción Seria
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        Solo reporta si el conductor realmente no apareció. Esto aplicará una penalización de 20 puntos al conductor.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-950 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
                    >
                        Volver
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 py-3 rounded-xl font-bold text-white text-sm shadow-lg transition-all active:scale-95 ${isCancel
                                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                                : 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20'
                            }`}
                    >
                        {isCancel ? (isPenalty ? 'Aceptar Penalización' : 'Confirmar Cancelación') : 'Enviar Reporte'}
                    </button>
                </div>

            </div>
        </div>
    )
}
