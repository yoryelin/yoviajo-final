import React, { useState } from 'react'

const PaymentModal = ({ booking, onClose, onPaymentSuccess, authFetch, API_URL }) => {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState('summary') // summary, processing, success

    const handlePayment = async () => {
        setLoading(true)
        setStep('processing')

        try {
            const res = await authFetch(`${API_URL}/payment/simulate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ booking_id: booking.id })
            })

            if (res.ok) {
                const data = await res.json()
                setTimeout(() => {
                    setStep('success')
                    setTimeout(() => {
                        onPaymentSuccess(data)
                    }, 2000)
                }, 1500) // Fake delay for UX
            } else {
                alert("Error al procesar el pago")
                setStep('summary')
            }
        } catch (error) {
            console.error(error)
            alert("Error de conexión durante el pago")
            setStep('summary')
        } finally {
            setLoading(false)
        }
    }

    if (!booking) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">

                {/* HEAD */}
                <div className="bg-gradient-to-r from-cyan-900 to-slate-900 p-6">
                    <h3 className="text-2xl font-black text-white text-center italic tracking-tighter">
                        PASARELA <span className="text-cyan-400">SEGURA</span>
                    </h3>
                </div>

                {/* BODY */}
                <div className="p-6">
                    {step === 'summary' && (
                        <>
                            <div className="text-center mb-6">
                                <p className="text-slate-400 text-sm mb-2">Confirmar reserva para:</p>
                                <div className="text-white font-bold text-lg">{booking.ride_origin} ➜ {booking.ride_destination}</div>
                                <div className="text-cyan-400 font-bold">{booking.ride_departure_time?.replace('T', ' ')}</div>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-400 text-sm">Fee de Reserva</span>
                                    <span className="text-white font-bold">$ {booking.fee_amount || 5000}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Impuestos</span>
                                    <span className="text-white font-bold">$ 0</span>
                                </div>
                                <div className="h-px bg-slate-700 my-3"></div>
                                <div className="flex justify-between items-center text-xl">
                                    <span className="text-cyan-400 font-bold">TOTAL</span>
                                    <span className="text-white font-black">$ {booking.fee_amount || 5000}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Procesando...' : '💳 PAGAR Y CONFIRMAR'}
                            </button>

                            <button onClick={onClose} className="w-full mt-3 text-slate-500 text-sm hover:text-white">
                                Cancelar
                            </button>
                        </>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-10">
                            <div className="text-6xl animate-spin mb-4">🔄</div>
                            <h4 className="text-white font-bold text-xl">Procesando Pago...</h4>
                            <p className="text-slate-400 text-sm">No cierres esta ventana.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-10 animate-scale-in">
                            <div className="text-6xl mb-4">✅</div>
                            <h4 className="text-white font-bold text-xl">¡Pago Exitoso!</h4>
                            <p className="text-cyan-400 text-sm">Tu reserva ha sido confirmada.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PaymentModal
