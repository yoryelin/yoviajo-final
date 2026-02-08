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
                        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    </a>
                    <a href="https://www.instagram.com/yoviajo.com.ar" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-600 transition" title="Síguenos en Instagram">
                        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
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
                                <h4 className="font-bold text-slate-900 mb-4 text-center text-lg">Entras, te registras y tu próximo viaje empieza acá:</h4>
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
