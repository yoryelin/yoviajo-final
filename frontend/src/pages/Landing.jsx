import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedLogo from '../components/AnimatedLogo';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
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
                    <button className="text-slate-500 hover:text-cyan-600 transition">Ayuda</button>
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

                {/* ESPACIO DERECHA (Con la ilustración del mapa) */}
                <div className="md:w-1/2 h-[400px] relative mt-12 md:mt-0 flex items-center justify-center">
                    {/* Aquí simulamos el concepto de Waze/Maps */}
                    <div className="w-full max-w-md aspect-square bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white relative transform rotate-3 hover:rotate-0 transition duration-500">
                        {/* Mapa Fake Interno */}
                        <div className="absolute inset-0 bg-[#e5e7eb] opacity-50">
                            <div className="absolute top-10 left-0 w-full h-2 bg-white rotate-12"></div>
                            <div className="absolute bottom-20 left-0 w-full h-8 bg-white -rotate-6"></div>
                            <div className="absolute top-0 right-20 w-4 h-full bg-white"></div>
                        </div>

                        {/* Ruta trazada */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <path d="M 80 300 Q 150 200 320 80" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray="10 5" className="animate-pulse" />
                        </svg>

                        {/* Pin Inicio */}
                        <div className="absolute bottom-16 left-16 bg-white p-2 rounded-full shadow-lg z-10">
                            <span className="text-3xl">🏠</span>
                        </div>

                        {/* Pin Fin */}
                        <div className="absolute top-12 right-12 bg-white p-2 rounded-full shadow-lg z-10">
                            <div className="text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* FOOTER */}
            <footer className="bg-white/90 border-t border-slate-200 py-6 text-center text-slate-400 text-xs font-medium z-10 backdrop-blur-md">
                <div className="flex justify-center gap-6 mb-2">
                    <a href="#" className="hover:text-slate-600 transition">Términos</a>
                    <a href="#" className="hover:text-slate-600 transition">Privacidad</a>
                    <a href="#" className="hover:text-slate-600 transition">Contacto</a>
                </div>
                <p>© 2026 YoViajo Inc. Todos los derechos reservados.</p>
            </footer>

            <style>{`
        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
        </div>
    );
}
