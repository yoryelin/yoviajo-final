import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mail } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 p-6 md:p-12 font-sans leading-relaxed">
            <div className="max-w-3xl mx-auto bg-slate-800/50 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center">

                <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                    <Link to="/" className="text-2xl font-black text-white hover:text-cyan-400 transition">
                        YoViajo<span className="text-yellow-400">!</span>
                    </Link>
                    <Link to="/" className="text-sm font-bold text-slate-400 hover:text-white transition">
                        ← Volver
                    </Link>
                </div>

                <h1 className="text-4xl font-black text-white mb-6">Contacto y Soporte</h1>

                <p className="mb-10 text-lg text-slate-400">
                    Estamos aquí para ayudarte. Si tienes dudas, problemas con un viaje o necesitas reportar algo, contáctanos.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Botón Email */}
                    <a
                        href="mailto:soporte@yoviajo.com.ar"
                        className="flex flex-col items-center justify-center p-8 bg-slate-700/30 rounded-2xl border border-slate-600 hover:bg-slate-700/50 hover:border-cyan-500 hover:scale-[1.02] transition group"
                    >
                        <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-cyan-500 transition">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Email</h2>
                        <p className="text-cyan-400 font-bold">soporte@yoviajo.com.ar</p>
                        <p className="text-xs text-slate-500 mt-2">Respuesta en 24hs</p>
                    </a>

                    {/* Botón WhatsApp */}
                    <a
                        href="https://wa.me/5491112345678" // Reemplazar con nro real si existe
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-8 bg-slate-700/30 rounded-2xl border border-slate-600 hover:bg-slate-700/50 hover:border-green-500 hover:scale-[1.02] transition group"
                    >
                        <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500 transition">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">WhatsApp</h2>
                        <p className="text-green-400 font-bold">+54 9 11 1234-5678</p>
                        <p className="text-xs text-slate-500 mt-2">Lunes a Viernes 9-18hs</p>
                    </a>
                </div>

                <div className="mt-12 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <h3 className="text-yellow-400 font-bold mb-2">¿Problemas con un pago?</h3>
                    <p className="text-sm">
                        Si tuviste un inconveniente con el Fee de Gestión o un pago duplicado, envíanos el comprobante por email con el asunto <strong>"Reclamo de Pago"</strong> para atención prioritaria.
                    </p>
                </div>

                <div className="mt-10 border-t border-slate-700 pt-6 text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} YoViajo Argentina. Todos los derechos reservados.
                </div>
            </div>
        </div>
    )
}
