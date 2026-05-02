import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function SecurityPage() {
    const sections = [
        {
            title: "1. Marco Normativo (Derecho Argentino)",
            icon: "⚖️",
            content: (
                <>
                    <p className="mb-4">
                        YoViajo se constituye como una plataforma de <strong>Economía Colaborativa</strong>. Nuestro modelo no es el transporte comercial, sino la ayuda mutua entre ciudadanos.
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                        <h4 className="font-bold text-cyan-400 mb-2">Transporte Benévolo (Art. 1282 CCC)</h4>
                        <p className="text-sm">
                            El Código Civil y Comercial distingue claramente el transporte de cortesía. En YoViajo, el aporte del pasajero es un <strong>reintegro de gastos compartidos</strong> (nafta/peajes), no un pago de pasaje comercial.
                        </p>
                    </div>
                </>
            )
        },
        {
            title: "2. Protección de tus Datos (Ley 25.326)",
            icon: "🛡️",
            content: (
                <>
                    <p className="mb-2">Recopilamos datos mínimos necesarios para garantizar la seguridad de la comunidad.</p>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li><strong>DNI y Contacto:</strong> Solo para fines de verificación y trazabilidad.</li>
                        <li><strong>Identidad Protegida:</strong> Tus datos de contacto solo se revelan una vez que el viaje está confirmado.</li>
                        <li><strong>Privacidad Forense:</strong> En caso de incidentes, contamos con pruebas digitales unívocas.</li>
                    </ul>
                </>
            )
        },
        {
            title: "3. Trazabilidad y Auditoría (AuditLog)",
            icon: "🔍",
            content: (
                <p className="text-sm">
                    Cada acción importante (match, publicación, cancelación) genera un <strong>registro inmutable</strong>. Capturamos IPs y marcas de tiempo para asegurar que la plataforma sea un entorno hostil para el mal uso, garantizando un historial transparente para cada usuario.
                </p>
            )
        },
        {
            title: "4. Protocolos de Respuesta y Moderación",
            icon: "🚫",
            content: (
                <p className="text-sm">
                    Contamos con un sistema de reportes directo. Cualquier comportamiento indebido es analizado por moderación humana. Aplicamos el <strong>Derecho de Admisión</strong> para proteger los estándares de convivencia y seguridad de nuestra red.
                </p>
            )
        }
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12 font-sans overflow-x-hidden">
            <div className="max-w-4xl mx-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
                    <Link to="/" className="text-3xl font-black text-white hover:text-cyan-400 transition tracking-tighter">
                        YoViajo<span className="text-yellow-400">!</span>
                    </Link>
                    <Link to="/" className="text-sm font-bold text-slate-500 hover:text-white transition uppercase tracking-widest">
                        ← Salir
                    </Link>
                </div>

                {/* Hero */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                        Confianza y <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">Transparencia</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
                        Conoce los pilares legales y técnicos que hacen de YoViajo el lugar más seguro para compartir tu camino.
                    </p>
                </motion.div>

                {/* Grid Sections */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition group shadow-xl"
                        >
                            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                {section.icon}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
                            <div className="text-slate-400 leading-relaxed">
                                {section.content}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* RoadMap horizontal */}
                <div className="bg-gradient-to-br from-cyan-900/20 to-pink-900/20 p-8 rounded-3xl border border-cyan-500/20 mb-16">
                    <h3 className="text-2xl font-black text-white mb-8 text-center uppercase tracking-widest">Hoja de Ruta de Seguridad 🚀</h3>
                    <div className="flex flex-col md:flex-row justify-between gap-8 items-start relative">
                        {/* Linea decorativa desktop */}
                        <div className="hidden md:block absolute top-[2.25rem] left-[10%] right-[10%] h-[2px] bg-slate-800 z-0"></div>
                        
                        {[
                            { step: "1", title: "Actual", desc: "Trazabilidad técnica y encuade colaborativo." },
                            { step: "2", title: "Escalado", desc: "Seguros específicos y validación biométrica." },
                            { step: "3", title: "Expansión", desc: "Cumplimiento regional Mercosur." }
                        ].map((m, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center text-center md:w-1/3">
                                <div className="w-12 h-12 bg-slate-900 border-2 border-cyan-500 rounded-full flex items-center justify-center font-black text-white mb-4 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                                    {m.step}
                                </div>
                                <h4 className="font-bold text-white mb-2">{m.title}</h4>
                                <p className="text-xs text-slate-400">{m.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center p-8 border-t border-slate-800">
                    <p className="text-sm font-bold text-slate-500 mb-2 italic">
                        "YoViajo no opera en el vacío legal; opera en la vanguardia de las relaciones digitales de Ayuda Mutua."
                    </p>
                    <p className="text-xs text-slate-600 uppercase tracking-widest font-black">
                        &copy; {new Date().getFullYear()} YoViajo Argentina
                    </p>
                </div>

            </div>
        </div>
    )
}
