import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HowItWorksDemo() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Ciclo infinito de la demo
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 4);
        }, 3500); // 3.5 segundos por paso
        return () => clearInterval(timer);
    }, []);

    const steps = [
        {
            title: "1. Busca tu Viaje",
            desc: "Ingresa origen, destino y fecha.",
            icon: "🔍",
            screen: (
                <div className="p-4 space-y-3">
                    <div className="h-8 bg-slate-100 rounded-lg w-full animate-pulse flex items-center px-2 text-xs text-slate-400">Buenos Aires...</div>
                    <div className="h-8 bg-slate-100 rounded-lg w-full animate-pulse flex items-center px-2 text-xs text-slate-400">Mar del Plata...</div>
                    <div className="h-10 bg-cyan-600 rounded-lg w-full flex items-center justify-center text-white font-bold shadow-lg">Buscar</div>
                </div>
            )
        },
        {
            title: "2. Elige Conductor",
            desc: "Verifica perfiles y precios.",
            icon: "🚗",
            screen: (
                <div className="p-3 space-y-2">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white border border-slate-200 p-2 rounded-lg shadow-sm flex gap-2 items-center">
                            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                            <div className="flex-1">
                                <div className="h-2 bg-slate-200 w-20 mb-1 rounded"></div>
                                <div className="h-2 bg-slate-100 w-12 rounded"></div>
                            </div>
                            <div className="text-cyan-600 font-bold text-xs">$5.000</div>
                        </div>
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-8 h-8 rounded-full bg-white/50 backdrop-blur border-2 border-cyan-500 shadow-xl"
                        />
                    </div>
                </div>
            )
        },
        {
            title: "3. Reserva Online",
            desc: "Paga la seña y asegura tu lugar.",
            icon: "💳",
            screen: (
                <div className="p-4 flex flex-col items-center justify-center h-full space-y-4">
                    <div className="w-16 h-10 bg-slate-100 rounded border border-slate-300 flex items-center justify-center text-xs">VISA</div>
                    <div className="h-2 bg-slate-100 w-32 rounded"></div>
                    <div className="h-10 bg-green-500 rounded-lg w-full flex items-center justify-center text-white font-bold shadow-green-500/20 shadow-lg">
                        Confirmar
                    </div>
                </div>
            )
        },
        {
            title: "4. ¡Viaja!",
            desc: "Coordina por WhatsApp y disfruta.",
            icon: "🎒",
            screen: (
                <div className="p-4 flex flex-col items-center justify-center h-full bg-slate-900 text-white relative overflow-hidden">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-4xl mb-2"
                    >
                        🎉
                    </motion.div>
                    <div className="font-bold text-lg">¡Buen Viaje!</div>
                    <div className="text-xs text-slate-400 mt-2">Te uniste al grupo de WhatsApp</div>

                    {/* Confetti fake */}
                    <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="absolute top-10 right-4 w-2 h-2 bg-pink-400 rounded-full"></div>
                    <div className="absolute bottom-8 left-8 w-2 h-2 bg-cyan-400 rounded-full"></div>
                </div>
            )
        }
    ];

    return (
        <section className="py-20 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                        Tan fácil como pedir comida
                    </h3>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        Olvídate de las terminales y las filas. Tu próximo viaje está en tu bolsillo.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">

                    {/* PHONE SIMULATOR */}
                    <div className="relative">
                        {/* Phone Frame */}
                        <div className="w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-8 border-slate-900 shadow-2xl relative overflow-hidden ring-4 ring-slate-200">
                            {/* Dynamic Screen Content */}
                            <div className="absolute inset-0 bg-white overflow-hidden">
                                <div className="h-full w-full flex flex-col">
                                    {/* Fake Header */}
                                    <div className="h-14 bg-slate-900 flex items-end pb-2 px-4 justify-between text-white/80">
                                        <div className="text-xs font-bold">9:41</div>
                                        <div className="flex gap-1">
                                            <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                                            <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Screen Area */}
                                    <div className="flex-1 relative bg-slate-50">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={step}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="h-full"
                                            >
                                                {steps[step].screen}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Fake Bottom Nav */}
                                    <div className="h-16 bg-white border-t border-slate-100 flex justify-around items-center px-4">
                                        <div className="w-6 h-6 rounded-full bg-cyan-100"></div>
                                        <div className="w-6 h-6 rounded-full bg-slate-100"></div>
                                        <div className="w-6 h-6 rounded-full bg-slate-100"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="absolute -right-8 top-20 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-2 hidden md:flex"
                        >
                            <span className="text-2xl">⚡</span>
                            <div>
                                <div className="text-xs font-bold text-slate-400">Tiempo de reserva</div>
                                <div className="font-bold text-slate-900">~ 45 segundos</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* STEPS LIST */}
                    <div className="space-y-8 max-w-sm">
                        {steps.map((s, index) => (
                            <div
                                key={index}
                                className={`flex gap-4 p-4 rounded-2xl transition-all duration-500 cursor-pointer ${step === index ? 'bg-white shadow-xl scale-105 border-l-4 border-cyan-500' : 'opacity-50 hover:opacity-80'}`}
                                onClick={() => setStep(index)}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm ${step === index ? 'bg-cyan-100' : 'bg-slate-100'}`}>
                                    {s.icon}
                                </div>
                                <div>
                                    <h4 className={`font-bold text-lg ${step === index ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {s.title}
                                    </h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {s.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Background Blob */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/2 h-[120%] bg-slate-50/50 -skew-x-12 -z-0 rounded-l-[100px]"></div>
        </section>
    );
}
