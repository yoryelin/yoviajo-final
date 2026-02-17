import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_DATA = {
    start: {
        text: "¡Hola! 👋 Soy el asistente virtual de YoViajo. ¿En qué puedo ayudarte hoy?",
        options: [
            { label: "📋 Requisitos de Registro", next: "requirements" },
            { label: "🚘 Soy Conductor", next: "driver" },
            { label: "🙋‍♂️ Soy Pasajero", next: "passenger" },
            { label: "🛡️ Seguridad", next: "safety" },
            { label: "💸 Pagos", next: "payments" },
        ]
    },
    requirements: {
        text: "Para ser parte de nuestra comunidad necesitas:\n\n✅ Ser mayor de 18 años.\n✅ DNI vigente (validamos tu identidad).\n✅ Email y Celular con WhatsApp.\n\n🚗 **Si eres Conductor:**\n✅ Licencia de conducir vigente.\n✅ Vehículo con seguro y VTV al día.",
        options: [
            { label: "⬅️ Volver al inicio", next: "start" }
        ]
    },
    driver: {
        text: "¡Genial! Como conductor, puedes publicar tus viajes y compartir gastos. \n\n1. Regístrate y carga tu vehículo.\n2. Publica tu viaje.\n3. Acepta pasajeros y coordina.\n\n¿Te gustaría saber sobre las ganancias?",
        options: [
            { label: "💰 Sobre Costos/Ganancias", next: "driver_costs" },
            { label: "⬅️ Volver al inicio", next: "start" }
        ]
    },
    driver_costs: {
        text: "En YoViajo no buscamos lucro, sino compartir gastos. \n\nEl sistema sugiere un precio máximo basado en el consumo de combustible y peajes. ¡Tú te ahorras el 100% de esos gastos al dividirlos!",
        options: [
            { label: "⬅️ Volver al inicio", next: "start" }
        ]
    },
    passenger: {
        text: "¡Bienvenido a bordo! 🚌\n\n1. Busca tu destino.\n2. Reserva tu asiento pagando una pequeña tasa de servicio.\n3. Recibe los datos del conductor y coordina el punto de encuentro.",
        options: [
            { label: "🔍 Cómo buscar viaje", next: "search_tips" },
            { label: "⬅️ Volver al inicio", next: "start" }
        ]
    },
    search_tips: {
        text: "Usa el buscador en la página principal. Ingresa origen, destino y fecha. Verás todos los conductores disponibles con sus calificaciones.",
        options: [
            { label: "⬅️ Volver al inicio", next: "start" }
        ]
    },
    safety: {
        text: "La seguridad es nuestra prioridad 🛡️.\n\n- Todos los usuarios (conductores y pasajeros) verifican su identidad.\n- Sistema de calificaciones y reseñas post-viaje.\n- Verificamos licencias de conducir.",
        options: [
            { label: "⬅️ Volver al inicio", next: "start" }
        ]
    },
    payments: {
        text: "El pago se divide en dos partes:\n\n1. **Reserva:** Se paga online (Mercado Pago) para asegurar tu lugar.\n2. **Viaje:** El resto se le paga DIRECTAMENTE al conductor al momento del viaje (Efectivo/Transferencia).",
        options: [
            { label: "⬅️ Volver al inicio", next: "start" }
        ]
    }
};

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState([FAQ_DATA['start']]);
    const [showBadge, setShowBadge] = useState(false);
    const messagesEndRef = useRef(null);

    // Show attention badge after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowBadge(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [history, isOpen]);

    const handleOptionClick = (nextKey) => {
        const nextStep = FAQ_DATA[nextKey];
        if (nextStep) {
            setHistory(prev => [...prev, { type: 'user', text: nextStep.label }, nextStep]);
        } else if (nextKey === 'start') {
            // Reset logic if needed, or just push start
            setHistory(prev => [...prev, FAQ_DATA['start']]);
        }
    };

    // Modified robust logic:
    // When clicking an option, we simulate a user message with the label text, 
    // then add the bot response.
    const handleSelectOption = (option) => {
        // Add user message
        const userMsg = { role: 'user', text: option.label };
        // Find next bot message
        const nextData = FAQ_DATA[option.next];

        setHistory(prev => [...prev, userMsg, { role: 'bot', ...nextData }]);
    };

    // Initialize history with correct structure
    useEffect(() => {
        setHistory([{ role: 'bot', ...FAQ_DATA['start'] }]);
    }, []);


    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* BADGE (Tooltip) */}
            <AnimatePresence>
                {!isOpen && showBadge && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="bg-white text-slate-800 px-4 py-2 rounded-xl shadow-xl mb-4 mr-2 relative font-bold text-sm border border-slate-100"
                    >
                        👋 ¿Tienes dudas?
                        {/* Little triangle pointer */}
                        <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white transform rotate-45 border-r border-b border-slate-100"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="bg-white w-[350px] max-w-[90vw] h-[500px] max-h-[70vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 mb-4"
                    >
                        {/* Header */}
                        <div className="bg-slate-900 p-4 flex justify-between items-center text-white shadow-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-xl shadow-inner">
                                    🤖
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Asistente YoViajo</h3>
                                    <span className="text-xs text-green-400 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> En línea
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
                            {history.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-line shadow-sm
                                        ${msg.role === 'user'
                                                ? 'bg-slate-800 text-white rounded-br-none'
                                                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>

                                    {/* Options (Only for bot messages) */}
                                    {msg.role === 'bot' && msg.options && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {msg.options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSelectOption(opt)}
                                                    // Disable clicked options (simple logic: only clicking last message options makes sense usually, but here we allow history exploration or just keep it active)
                                                    disabled={idx !== history.length - 1}
                                                    className={`px-3 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 text-xs font-bold rounded-lg transition border border-cyan-200
                                                        ${idx !== history.length - 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                                    `}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* LAUNCHER BUTTON */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                    setIsOpen(!isOpen);
                    setShowBadge(false); // Hide badge once opened
                }}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl transition-colors z-50
                    ${isOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'}
                `}
            >
                {isOpen ? '✕' : '💬'}
            </motion.button>
        </div>
    );
}
