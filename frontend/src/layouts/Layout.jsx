// import { useNavigate } from 'react-router-dom' // Unused

import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import ProfileModal from '../components/ProfileModal'
import VerificationNagModal from '../components/VerificationNagModal'

const Layout = ({ children }) => {
    const { user, logout } = useAuth()
    // const navigate = useNavigate() // Unused

    const [showProfileModal, setShowProfileModal] = useState(false)
    const [showNagModal, setShowNagModal] = useState(false)

    useEffect(() => {
        // Show Nag Modal if unverified and not dismissed in this session
        if (user && user.verification_status !== 'verified' && user.verification_status !== 'pending') {
            const hasSeenNag = sessionStorage.getItem('verification_nag_dismissed')
            if (!hasSeenNag) {
                // Delay slightly for better UX
                const timer = setTimeout(() => setShowNagModal(true), 1500)
                return () => clearTimeout(timer)
            }
        }
    }, [user])

    const handleDismissNag = () => {
        setShowNagModal(false)
        sessionStorage.setItem('verification_nag_dismissed', 'true')
    }

    const isDriver = user?.role === 'C'
    const RAW_URL = import.meta.env.VITE_API_URL || 'https://api.yoviajo.com.ar'
    const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-cyan-500 selection:text-white overflow-x-hidden pb-32">
            {/* --- HEADER --- */}
            <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-2xl py-4">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* LOGO */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-baseline select-none filter drop-shadow-lg">
                            <a href="/" className="flex items-baseline hover:opacity-90 transition">
                                <h1 className="text-4xl md:text-5xl font-black flex tracking-tighter">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-600">Yo</span>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-pink-300 to-pink-600 ml-0.5">Viajo</span>
                                </h1>
                                <div className="ml-1 relative animate-bounce-pin">
                                    <span className="text-yellow-400 text-4xl md:text-5xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] relative z-10 font-black">!</span>
                                </div>
                            </a>
                        </div>
                        {/* ROL ACTIVO BADGE */}
                        {user && (
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDriver ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-400' : 'bg-pink-950/50 border-pink-500/50 text-pink-400'
                                }`}>
                                {isDriver ? 'Modo Conductor' : 'Modo Pasajero'}
                            </div>
                        )}
                    </div>

                    {/* USUARIO */}
                    {user && (
                        <div className="flex items-center gap-4">
                            <a href="/my-trips" className="text-xs md:text-sm font-bold text-slate-400 hover:text-white transition uppercase tracking-widest whitespace-nowrap">
                                Mis Viajes
                            </a>

                            {user.role === 'admin' && (
                                <a href="/admin" className="text-xs md:text-sm font-bold text-purple-400 hover:text-purple-300 transition uppercase tracking-widest whitespace-nowrap border border-purple-500/30 px-3 py-1 rounded-full bg-purple-900/10">
                                    Admin Panel
                                </a>
                            )}

                            <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/50 px-4 py-1.5 rounded-full hover:border-slate-600 transition cursor-default">
                                <div
                                    className="flex items-center space-x-3 bg-slate-800/50 hover:bg-slate-700/50 p-2 rounded-xl border border-slate-700/50 transition cursor-pointer"
                                    onClick={() => setShowProfileModal(true)}
                                >
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br p-[2px] ${isDriver ? 'from-cyan-400 to-blue-600' : 'from-pink-400 to-rose-600'}`}>
                                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                            {false ? (
                                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg font-bold text-white uppercase">{user.name ? user.name[0] : user.username[0]}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-bold text-white">{user.name || user.username}</p>
                                        <p className="text-xs text-slate-400 font-medium">Editar Perfil</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        logout()
                                        window.location.href = '/'
                                    }}
                                    className="ml-2 px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-red-400 transition uppercase tracking-wider"
                                >
                                    Salir
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header >

            {/* --- VERIFICATION BANNER --- */}
            {user && user.verification_status !== 'verified' && user.verification_status !== 'pending' && (
                <div className="bg-red-900/50 border-b border-red-500/30 px-4 py-2 flex items-center justify-between backdrop-blur-md sticky top-[80px] z-30 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <p className="text-xs md:text-sm font-bold text-white">
                            Tu identidad no está verificada. <span className="opacity-75 font-normal hidden md:inline">Sube tu DNI para operar con seguridad.</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setShowProfileModal(true)}
                        className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase py-1 px-3 rounded-full transition shadow-lg shadow-red-900/40 tracking-wider whitespace-nowrap"
                    >
                        Verificar Ahora
                    </button>
                </div>
            )}
            {user && user.verification_status === 'pending' && (
                <div className="bg-yellow-900/50 border-b border-yellow-500/30 px-4 py-1 flex items-center justify-center backdrop-blur-md sticky top-[80px] z-30">
                    <p className="text-[10px] font-bold text-yellow-200 flex items-center gap-2">
                        ⏳ Tu verificación está en proceso de revisión.
                    </p>
                </div>
            )}

            {/* Main Content Injection */}
            <main className="max-w-4xl mx-auto px-4 py-8 mb-auto">
                {children}
            </main>

            {/* FOOTER (Logged In) */}
            <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-xs mt-auto bg-slate-950/50">
                <div className="flex justify-center gap-6 mb-2">
                    <a href="/terms" className="hover:text-cyan-400 transition">Términos</a>
                    <a href="/privacy" className="hover:text-cyan-400 transition">Privacidad</a>
                    <a href="/contact" className="hover:text-cyan-400 transition">Contacto</a>
                </div>
                <p>&copy; {new Date().getFullYear()} YoViajo Argentina. Todos los derechos reservados.</p>
            </footer>

            {/* Global Modals (Like Profile) */}

            {/* Global Modals (Like Profile) */}
            < ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                user={user}
                API_URL={API_URL}
                authFetch={async (url, options) => {
                    const token = localStorage.getItem('token')
                    return fetch(url, {
                        ...options,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            ...options?.headers,
                        },
                    })
                }}
                onUpdate={() => window.location.reload()}
            />

            <VerificationNagModal
                isOpen={showNagModal}
                onClose={handleDismissNag}
                onVerify={() => {
                    setShowNagModal(false)
                    setShowProfileModal(true) // Switch to Profile Modal for upload
                }}
            />
        </div >
    )
}

export default Layout
