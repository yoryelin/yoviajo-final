import React from 'react'
import { Link } from 'react-router-dom'

export default function PrivacyPage() {
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

                <h1 className="text-3xl font-black text-white mb-6">Política de Privacidad</h1>

                <p className="mb-6">
                    En <strong>YoViajo</strong>, nos tomamos muy en serio la seguridad y privacidad de tus datos. Esta política explica qué información recopilamos y cómo la utilizamos.
                </p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">1. Datos que Recopilamos</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li><strong>Información de Identidad:</strong> Nombre, DNI, Fecha de Nacimiento (para verificar mayoría de edad).</li>
                            <li><strong>Información de Contacto:</strong> Email y Número de Teléfono (WhatsApp) para coordinar viajes.</li>
                            <li><strong>Datos del Vehículo (Solo Conductores):</strong> Modelo, Patente, Color y estado de la documentación.</li>
                            <li><strong>Ubicación:</strong> Origen y destino de tus viajes para encontrar coincidencias.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">2. Uso de la Información</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li><strong>Coordinación de Viajes:</strong> Compartimos tu nombre y teléfono con tu compañero de viaje (Conductor o Pasajero) <u>únicamente</u> después de confirmar una reserva.</li>
                            <li><strong>Seguridad:</strong> Utilizamos tu DNI para validar tu identidad y mantener la comunidad segura.</li>
                            <li><strong>Comunicaciones:</strong> Te enviamos notificaciones sobre el estado de tus viajes y recupero de contraseñas.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">3. Compartir Datos con Terceros</h2>
                        <p className="text-sm mb-2">No vendemos tus datos a nadie. Solo compartimos información con:</p>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li><strong>Proveedores de Servicios:</strong> Como MercadoPago (procesamiento de pagos) y Resend (envío de emails), estrictamente para el funcionamiento de la app.</li>
                            <li><strong>Autoridades:</strong> Solo si somos requeridos legalmente por una orden judicial.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-cyan-400 mb-3">4. Tus Derechos</h2>
                        <p className="text-sm">
                            Puedes acceder, rectificar o eliminar tus datos en cualquier momento desde tu perfil o contactándonos a soporte@yoviajo.com.ar. Ten en cuenta que eliminar ciertos datos puede impedirte usar la plataforma.
                        </p>
                    </section>
                </div>

                <div className="mt-10 border-t border-slate-700 pt-6 text-center text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} YoViajo Argentina. Todos los derechos reservados.
                </div>
            </div>
        </div>
    )
}
