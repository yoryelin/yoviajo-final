// import { useNavigate } from 'react-router-dom' // Unused

import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import ProfileModal from '../components/ProfileModal'

const Layout = ({ children }) => {
    const { user, logout } = useAuth()
    // const navigate = useNavigate() // Unused

    const [showProfileModal, setShowProfileModal] = useState(false)
    const isDriver = user?.role === 'C'
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8003/api'

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
                            <a href="/my-trips" className="hidden md:block text-sm font-bold text-slate-400 hover:text-white transition uppercase tracking-widest">
                                Mis Viajes
                            </a>
                            <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/50 px-4 py-1.5 rounded-full hover:border-slate-600 transition cursor-default">
                                <div
                                    className="flex items-center space-x-3 bg-slate-800/50 hover:bg-slate-700/50 p-2 rounded-xl border border-slate-700/50 transition cursor-pointer"
                                    onClick={() => window.location.href = '/profile'}
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

            {/* Main Content Injection */}
            < main className="max-w-4xl mx-auto px-4 py-8" >
                {children}
            </main >

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
        </div >
    )
}

export default Layout
