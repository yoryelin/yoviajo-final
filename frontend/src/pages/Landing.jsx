import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import AnimatedLogo from '../components/AnimatedLogo';
import { useAuth } from '../context/AuthContext';
import HowItWorksDemo from '../components/landing/HowItWorksDemo';

export default function Landing() {
    const [showHelp, setShowHelp] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Animación del brillo en el texto
    const shineVariant = {
        initial: { backgroundPosition: '-200% center' },
        animate: {
            backgroundPosition: '200% center',
            transition: {
                repeat: 0, // Una sola vez como pidió el usuario
                duration: 2,
                ease: "linear",
                delay: 1 // Espera un poco a que cargue la página
            }
        }
    };

    const handleAction = (role) => {
        if (user) {
            navigate('/dashboard');
        } else {
            // Pass intended role via sessionStorage (more robust for redirects)
            sessionStorage.setItem('intendedRole', role);
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] relative overflow-hidden font-sans text-slate-800 flex flex-col">

            {/* 🗺️ FONDO TIPO MAPA (CSS Pattern) */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                {/* Simulamos calles con gradientes */}
                <div className="w-full h-full"
                    style={{
                        backgroundImage: `
                 linear-gradient(90deg, transparent 49px, #d1d5db 49px, #d1d5db 51px, transparent 51px),
                 linear-gradient(#d1d5db 1px, transparent 1px)
               `,
                        backgroundSize: '100px 100px', // Cuadras grandes
                        backgroundColor: '#f8fafc'
                    }}>
                </div>
                {/* Diagonal "Avenida" */}
                <div className="absolute top-0 left-0 w-[150%] h-40 bg-white/50 rotate-[35deg] transform -translate-x-40 translate-y-96 blur-sm"></div>
            </div>

            {/* 📍 PINES MAPA DECORATIVOS (Partida / Llegada) */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="absolute top-1/3 right-[15%] z-0 hidden md:block"
            >
                <div className="relative">
                    <span className="text-4xl absolute -top-12 -left-2 animate-bounce">📍</span>
                    <div className="w-32 h-32 border-4 border-dashed border-cyan-400/50 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-transparent transform rotate-45 translate-y-16 translate-x-16 w-40"></div>
                    <span className="text-4xl absolute top-24 left-32 animate-bounce delay-700">🏁</span>
                </div>
            </motion.div>


            {/* NAV / HEADER */}
            <nav className="relative z-20 p-6 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
                <div className="scale-75 origin-left">
                    <AnimatedLogo size="text-3xl" />
                </div>
                <div className="space-x-4 text-sm font-bold">
                    <button onClick={() => setShowHelp(true)} className="text-slate-500 hover:text-cyan-600 transition">Ayuda</button>
                    <button onClick={handleAction} className="bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-700 transition shadow-lg">
                        {user ? 'Ir a mi Dashboard' : 'Ingresar'}
                    </button>
                </div>
            </nav>

            {/* HERO SECTION */}
            <main className="flex-grow flex flex-col md:flex-row items-center justify-between relative z-10 container mx-auto px-6 py-12">

                {/* TEXTO IZQUIERDA */}
                <div className="md:w-1/2 space-y-8 text-center md:text-left pt-10 md:pt-0">

                    <div className="mb-4">
                        <AnimatedLogo size="text-6xl md:text-8xl" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                            <span
                                className="block bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-500 to-slate-900 bg-[length:200%_auto]"
                                style={{
                                    animation: 'shine 3s linear 1 forwards', // CSS Animation fallback
                                }}
                            >
                                Acercando personas
                            </span>
                            <span
                                className="block text-slate-800"
                            >
                                Uniendo destinos
                            </span>
                        </h2>
                    </div>

                    <p className="text-lg text-slate-600 max-w-md mx-auto md:mx-0 leading-relaxed">
                        La forma más inteligente de viajar. Comparte tu auto, reduce costos y viaja seguro con nuestra comunidad verificada.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction('C')}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl shadow-xl shadow-cyan-500/20 font-bold text-lg flex items-center justify-center gap-2"
                        >
                            <span>🚘</span> {user ? 'Soy Conductor' : 'Soy Conductor'}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction('P')} // Por ahora ambos van al login
                            className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl shadow-lg hover:border-cyan-500 transition font-bold text-lg flex items-center justify-center gap-2"
                        >
                            <span>🙋‍♂️</span> {user ? 'Soy Pasajero' : 'Soy Pasajero'}
                        </motion.button>
                    </div>

                </div>

                {/* IMAGEN / MAPA DERECHA (Ahora Animado) */}
                <div className="md:w-1/2 relative mt-12 md:mt-0 flex justify-center">
                    <HowItWorksDemo />
                </div>

            </main>

            {/* FOOTER */}
            <footer className="bg-white/90 border-t border-slate-200 py-6 text-center text-slate-400 text-xs font-medium z-10 backdrop-blur-md">
                <div className="flex justify-center gap-6 mb-2 items-center">
                    <a href="https://www.facebook.com/share/1H63M6mon9/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition" title="Síguenos en Facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    </a>
                    <a href="https://www.instagram.com/yoviajo.com.ar" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700 transition" title="Síguenos en Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg>
                    </a>
                    <Link to="/terms" className="hover:text-slate-600 transition">Términos</Link>
                    <Link to="/privacy" className="hover:text-slate-600 transition">Privacidad</Link>
                    <a href="mailto:soporte@yoviajo.com.ar" className="hover:text-slate-600 transition">Contacto</a>
                </div>
                <p>© 2026 YoViajo Inc. Todos los derechos reservados.</p>
            </footer>

            {/* HELP MODAL */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowHelp(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
                        >
                            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                                <h3 className="text-xl font-bold">🤔 ¿Cómo funciona?</h3>
                                <button onClick={() => setShowHelp(false)} className="bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition">✕</button>
                            </div>
                            <div className="p-8 space-y-6 text-slate-600 overflow-y-auto max-h-[70vh]">
                                <h4 className="font-bold text-slate-900 mb-4 text-center text-lg">
                                    Entras, te registras y tu próximo viaje empieza acá:
                                    <span className="block text-sm font-normal text-slate-500 mt-1">(solo mayores de 18 años)</span>
                                </h4>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <span className="bg-cyan-100 text-cyan-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">1</span>
                                        <div>
                                            <strong className="text-slate-900 block">Encontrar tu Viaje</strong>
                                            <span className="text-sm">Busca por ciudad, fecha y horario. Verás usuarios verificados que van a tu mismo destino.</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="bg-cyan-100 text-cyan-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">2</span>
                                        <div>
                                            <strong className="text-slate-900 block">Reservar Online</strong>
                                            <span className="text-sm">Asegura tu asiento pagando una pequeña tasa de servicio por la plataforma.</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="bg-cyan-100 text-cyan-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">3</span>
                                        <div>
                                            <strong className="text-slate-900 block">Coordinar y Viajar</strong>
                                            <span className="text-sm">Recibe el WhatsApp del conductor, arreglen el punto de encuentro y ¡listo!</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="bg-cyan-100 text-cyan-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">4</span>
                                        <div>
                                            <strong className="text-slate-900 block">¡Compartir!</strong>
                                            <span className="text-sm">Al subir, únicamente compartes los gastos del viaje (nafta/peajes) directo con el conductor.</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition w-full"
                                >
                                    ¡Entendido!
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
        </div>
    );
}
