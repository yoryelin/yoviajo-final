import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HowItWorksDemo() {
    const [step, setStep] = useState(0);

    const stepsCount = 5;

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % stepsCount);
        }, 4000); // 4 segundos para leer mejor
        return () => clearInterval(timer);
    }, []);

    const steps = [
        {
            title: "1. Regístrate Gratis",
            desc: "Crea tu perfil en segundos.",
            icon: "👋",
            screen: (
                <div className="p-6 flex flex-col items-center justify-center h-full space-y-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-2">👤</div>
                    <div className="h-2 bg-slate-800 w-32 rounded"></div>
                    <div className="h-2 bg-slate-800 w-24 rounded"></div>
                    <div className="h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl w-full flex items-center justify-center text-white font-bold shadow-lg mt-4 text-sm border border-cyan-500/30">
                        Crear Cuenta
                    </div>
                </div>
            )
        },
        {
            title: "2. Busca tu Viaje",
            desc: "Ingresa origen, destino y fecha.",
            icon: "🔍",
            screen: (
                <div className="p-4 space-y-3 pt-8">
                    <div className="h-10 bg-slate-800 rounded-xl w-full animate-pulse flex items-center px-3 text-xs text-slate-400 border border-slate-700">
                        <span className="mr-2">📍</span> Buenos Aires...
                    </div>
                    <div className="h-10 bg-slate-800 rounded-xl w-full animate-pulse flex items-center px-3 text-xs text-slate-400 border border-slate-700">
                        <span className="mr-2">🏁</span> Mar del Plata...
                    </div>
                    <div className="h-12 bg-cyan-700 rounded-xl w-full flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-900/50 mt-4 border border-cyan-500/20">
                        Buscar
                    </div>
                </div>
            )
        },
        {
            title: "3. Elige al Conductor",
            desc: "Verifica perfiles y calificaciones.",
            icon: "⭐",
            screen: (
                <div className="p-3 space-y-3 pt-6">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-sm flex gap-3 items-center transform transition-transform hover:scale-105">
                            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden relative">
                                <div className="absolute inset-0 bg-slate-600 animate-pulse"></div>
                            </div>
                            <div className="flex-1">
                                <div className="h-2.5 bg-slate-600 w-24 mb-1.5 rounded-full"></div>
                                <div className="flex gap-1">
                                    <div className="h-2 bg-yellow-500 w-12 rounded-full"></div>
                                </div>
                            </div>
                            <div className="text-slate-500">➜</div>
                        </div>
                    ))}
                    {/* Finger tap simulation */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-4">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                            transition={{ duration: 0.5, delay: 1 }}
                            className="w-8 h-8 rounded-full bg-cyan-500/50 backdrop-blur border-2 border-white shadow-xl"
                        />
                    </div>
                </div>
            )
        },
        {
            title: "4. Reserva Online",
            desc: "Asegura tu lugar al instante.",
            icon: "🔒",
            screen: (
                <div className="p-5 flex flex-col items-center justify-center h-full space-y-6">
                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 w-full text-center">
                        <div className="text-4xl mb-2">✅</div>
                        <div className="text-sm text-slate-300 font-medium">Asiento Disponible</div>
                    </div>
                    <div className="h-12 bg-green-600 rounded-xl w-full flex items-center justify-center text-white font-bold shadow-lg shadow-green-900/40 text-sm border border-green-500/30">
                        Confirmar Reserva
                    </div>
                </div>
            )
        },
        {
            title: "5. ¡Viaja!",
            desc: "Coordina por WhatsApp y disfruta.",
            icon: "🎒",
            screen: (
                <div className="p-4 flex flex-col items-center justify-center h-full bg-slate-900 text-white relative overflow-hidden">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                        className="text-5xl mb-4"
                    >
                        🚗💨
                    </motion.div>
                    <div className="font-bold text-xl mb-1">¡Todo listo!</div>
                    <div className="text-[10px] text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                        Te uniste al grupo de WhatsApp
                    </div>

                    {/* Confetti */}
                    <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                    <div className="absolute bottom-10 right-10 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
                </div>
            )
        }
    ];

    return (
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-12">

            {/* PHONE SIMULATOR - Always Visible */}
            <div className="relative shrink-0 transform scale-90 md:scale-100 origin-center">
                {/* Phone Frame */}
                <div className="w-[260px] h-[520px] bg-slate-900 rounded-[2.5rem] border-[6px] border-slate-900 shadow-2xl relative overflow-hidden ring-4 ring-slate-800">
                    {/* Dynamic Screen Content */}
                    <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                        <div className="h-full w-full flex flex-col">
                            {/* Fake Header */}
                            <div className="h-12 bg-slate-900 flex items-end pb-2 px-4 justify-between text-white/80 z-20 border-b border-slate-800">
                                <div className="text-[10px] font-bold text-slate-400">9:41</div>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                            </div>

                            {/* Screen Area */}
                            <div className="flex-1 relative bg-slate-900 flex flex-col">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="h-full w-full absolute inset-0 text-slate-200"
                                    >
                                        {steps[step].screen}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Fake Bottom Nav */}
                            <div className="h-14 bg-slate-900 border-t border-slate-800 flex justify-around items-center px-4 z-20">
                                <div className="w-5 h-5 rounded-full bg-cyan-900/50 border border-cyan-500/30"></div>
                                <div className="w-5 h-5 rounded-full bg-slate-800"></div>
                                <div className="w-5 h-5 rounded-full bg-slate-800"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STEPS LIST - Hidden on small mobile, visible on larger screens */}
            {/* On mobile, we show a small 'active step' indicator below/above the phone instead of the full list */}
            <div className="flex-1 max-w-xs hidden md:block space-y-3">
                {steps.map((s, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer ${step === index ? 'bg-white/80 shadow-lg border-l-4 border-cyan-500 backdrop-blur-sm' : 'opacity-40 hover:opacity-100'}`}
                        onClick={() => setStep(index)}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm shrink-0 ${step === index ? 'bg-cyan-100' : 'bg-slate-200'}`}>
                            {step === index ? s.icon : index + 1}
                        </div>
                        <div>
                            <h4 className={`font-bold text-sm ${step === index ? 'text-slate-900' : 'text-slate-600'}`}>
                                {s.title}
                            </h4>
                            {step === index && (
                                <p className="text-xs text-slate-500 leading-tight mt-1">
                                    {s.desc}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Only Step Indicator */}
            <div className="md:hidden text-center bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-slate-200 text-xs font-bold text-slate-600 animate-fade-in mt-[-10px] relative z-20">
                {steps[step].icon} {steps[step].title}
            </div>

        </div>
    );
}
