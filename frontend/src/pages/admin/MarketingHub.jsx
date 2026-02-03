import React, { useState } from 'react'
import { API_URL } from '@config/api.js'

export default function MarketingHub() {
    const [activeTab, setActiveTab] = useState('driver')
    const [copiedId, setCopiedId] = useState(null)

    // Base links (auto-detect production URL later if needed, hardcoded or relative for now)
    // We use relative paths or constructing full URL based on window.location.origin
    const getLink = (role) => `${window.location.origin}/login?role=${role}`

    const strategies = {
        driver: [
            {
                id: 'driver-save',
                title: '💰 El Ahorrador',
                context: 'Para grupos de "Viajes compartidos" o "Compra/Venta".',
                text: `⚠️ ¿Viajas en auto? ¡No pierdas plata!\n\nSi vas a viajar pronto, no vayas con asientos vacíos. Publicá tu viaje en YoViajo!, llevá compañeros y cubrí hasta el 100% de la nafta.\n\n✅ Es 100% seguro (usuarios verificados).\n✅ Vos elegís a quién llevar.\n✅ Cobrás en efectivo o transfer.\n\n👉 Registrate como Conductor acá: ${getLink('C')}`,
                tags: ['Ahorro', 'Nafta', 'Seguridad']
            },
            {
                id: 'driver-empty',
                title: '🚗 ¿Asientos vacíos?',
                context: 'Para estados de WhatsApp o Stories.',
                text: `¿Alguien necesita viajar? 🙋‍♂️\n\nTengo lugar en el auto. Voy a salir pronto. Si quieren viajar cómodos y seguros, búsquenme en YoViajo!.\n\nLink para reservar lugar: ${getLink('P')}\n(O escríbanme)`,
                tags: ['Casual', 'WhatsApp']
            }
        ],
        passenger: [
            {
                id: 'pass-comfort',
                title: '🚌 El Cómodo',
                context: 'Para grupos de estudiantes o quejas de colectivos.',
                text: `¿Cansado de los horarios fijos y boletos caros? 🤯\n\nProbá viajar en auto con YoViajo!. Viajas con aire, buena onda y llegás más rápido. \n\n🔎 Buscá tu próximo destino hoy mismo.\n\n👉 Reservá tu asiento acá: ${getLink('P')}`,
                tags: ['Comodidad', 'Transporte']
            },
            {
                id: 'pass-urgent',
                title: '🏃 El Urgente',
                context: 'Para cuando no hay pasajes.',
                text: `¡No te quedes sin viajar! 🚀\nEncontrá conductores que van a tu mismo destino en YoViajo!. \n\n✅ Perfiles verificados.\n✅ Precios justos.\n✅ Reserva online.\n\nEntrá ahora: ${getLink('P')}`,
                tags: ['Urgencia', 'Disponibilidad']
            }
        ]
    }

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">📢 Marketing Hub</h1>
                <p className="text-slate-400">Herramientas de difusión masiva para redes sociales.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-800 pb-1">
                <button
                    onClick={() => setActiveTab('driver')}
                    className={`px-4 py-2 font-bold text-sm transition-colors relative ${activeTab === 'driver' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Captar Conductores 🚘
                    {activeTab === 'driver' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('passenger')}
                    className={`px-4 py-2 font-bold text-sm transition-colors relative ${activeTab === 'passenger' ? 'text-pink-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Captar Pasajeros 🙋‍♂️
                    {activeTab === 'passenger' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500"></div>}
                </button>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {strategies[activeTab].map(strategy => (
                    <div key={strategy.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 transition-all hover:border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    {strategy.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">{strategy.context}</p>
                            </div>
                            <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                                {strategy.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-full uppercase tracking-wider">{tag}</span>
                                ))}
                            </div>
                        </div>

                        {/* Copy Box */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-dashed border-slate-800 relative group">
                            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                                {strategy.text}
                            </pre>

                            <button
                                onClick={() => handleCopy(strategy.text, strategy.id)}
                                className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all shadow-lg flex items-center gap-1 ${copiedId === strategy.id
                                        ? 'bg-green-600 text-white translate-y-0 opacity-100'
                                        : 'bg-white text-slate-900 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                                    }`}
                            >
                                {copiedId === strategy.id ? '✅ Copiado' : '📋 Copiar'}
                            </button>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-xs text-slate-500">Perfecto para: Facebook Groups, Marketplace, WhatsApp.</span>
                            <button
                                onClick={() => handleCopy(strategy.text, strategy.id)}
                                className="text-cyan-400 text-sm font-bold hover:underline md:hidden"
                            >
                                Copiar Texto
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Direct Links Section */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 mt-8">
                <h3 className="text-lg font-bold text-white mb-4">🔗 Links Directos (Para biografía de Instagram / Perfiles)</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-slate-950 p-3 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Registro de Conductor</p>
                            <code className="text-cyan-400 text-sm">{getLink('C')}</code>
                        </div>
                        <button onClick={() => handleCopy(getLink('C'), 'link-c')} className="text-slate-400 hover:text-white">📋</button>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Registro de Pasajero</p>
                            <code className="text-pink-400 text-sm">{getLink('P')}</code>
                        </div>
                        <button onClick={() => handleCopy(getLink('P'), 'link-p')} className="text-slate-400 hover:text-white">📋</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
