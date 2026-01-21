import React from 'react'
import { Link } from 'react-router-dom'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 p-6 md:p-12 font-sans leading-relaxed">
            <div className="max-w-3xl mx-auto bg-slate-800/50 p-8 rounded-3xl border border-slate-700 shadow-2xl">

                <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                    <Link to="/" className="text-2xl font-black text-white hover:text-cyan-400 transition">
                        YoViajo<span className="text-yellow-400">!</span>
                    </Link>
                    <Link to="/" className="text-sm font-bold text-slate-400 hover:text-white transition">
                        ← Volver
                    </Link>
                </div>

                <h1 className="text-3xl font-black text-white mb-6">Reglamento y Condiciones de Uso</h1>

                <p className="mb-6 p-4 bg-blue-500/10 border-l-4 border-blue-500 text-blue-200 text-sm font-bold rounded-r-lg">
                    YoViajo es una plataforma tecnológica de colaboración comunitaria. No somos una empresa de transporte ni empleamos a los conductores. Nuestro objetivo es conectar personas que viajan al mismo destino para compartir gastos y reducir el impacto ambiental.
                </p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">1. El Espíritu Colaborativo ("Patrón Nafta")</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li><strong>Unidad de Valor:</strong> Los costos se calculan en Litros de Nafta.</li>
                            <li><strong>Carácter No Vinculante:</strong> El cálculo del sistema es una referencia. Conductor y Pasajero acuerdan libremente el monto final.</li>
                            <li><strong>Prohibición de Lucro:</strong> Está prohibido usar la app para fines comerciales. El aporte es solo para gastos operativos.</li>
                            <li><strong>Peajes:</strong> Se dividen entre los ocupantes y no están incluidos en el cálculo automático.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">2. El Fee de Gestión (La "Llave")</h2>
                        <p className="mb-2 text-sm">Para mantener la plataforma, cobramos un pequeño costo de gestión por viaje confirmado.</p>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Es obligatorio para ver los datos de contacto.</li>
                            <li>El Pasajero es responsable de este pago.</li>
                            <li>Es lo único que se paga a través de la App (MercadoPago). El resto, directo al conductor.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">3. Dinámica del Viaje</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li><strong>Reserva:</strong> Se confirma al pagar el Fee.</li>
                            <li><strong>Pago de Gastos:</strong> Se abona al conductor al subir al auto (Efectivo/Transferencia).</li>
                            <li><strong>Ausencias:</strong> Si el pasajero falta, pierde el Fee. Si el conductor cancela injustificadamente, pierde reputación.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">4. Seguridad y Convivencia</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li><strong>Verificación:</strong> Validamos identidad para mayor seguridad.</li>
                            <li><strong>Tolerancia Cero:</strong> No se permite acoso ni agresión. Expulsión inmediata.</li>
                            <li><strong>Mujeres al Volante:</strong> Conductoras pueden elegir llevar solo pasajeras mujeres.</li>
                        </ul>
                    </section>
                </div>

                <div className="mt-10 border-t border-slate-700 pt-6 text-center text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} YoViajo Argentina. Todos los derechos reservados.
                </div>
            </div>
        </div>
    )
}
