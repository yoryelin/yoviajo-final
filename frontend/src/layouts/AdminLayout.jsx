import React, { useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom' // Ensure Link is imported if used
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                navigate('/')
            }
        }
    }, [user, loading, navigate])

    if (loading) return <div className="text-white p-10">Cargando panel...</div>

    if (!user || user.role !== 'admin') return null

    const navItems = [
        { path: '/admin', label: '📊 Dashboard', exact: true },
        { path: '/admin/verifications', label: '🛡️ Verificaciones' },
        { path: '/admin/users', label: '👥 Usuarios' },
        { path: '/admin/rides', label: '🚗 Viajes' },
    ]

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        A
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">Admin<span className="text-cyan-400">Panel</span></span>
                </div>

                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path)

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-4 py-3 rounded-xl font-medium transition-all ${isActive
                                        ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt="Admin" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white max-w-[120px] truncate">{user.name}</span>
                            <span className="text-xs text-slate-500">Super Admin</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
