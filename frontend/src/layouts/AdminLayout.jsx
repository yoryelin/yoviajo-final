import React, { useEffect, useState, useRef } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '@config/api.js'
import NotificationToast from '../components/admin/NotificationToast'

export default function AdminLayout() {
    const { user, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Notification System
    const [notifications, setNotifications] = useState([])
    const previousStats = useRef(null)
    const audioRef = useRef(new Audio('/notification.mp3')) // Expects file in public folder, or will just fail silently

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                navigate('/')
            }
        }
    }, [user, loading, navigate])

    // Polling for Notifications
    useEffect(() => {
        if (!user || user.role !== 'admin') return;

        const checkStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const currentStats = await res.json();

                    if (previousStats.current) {
                        const prev = previousStats.current;
                        const newNotifs = [];

                        // 1. Check for New Users
                        if (currentStats.total_users > prev.total_users) {
                            newNotifs.push({
                                id: Date.now() + 'user',
                                type: 'user',
                                title: 'Nuevo Usuario',
                                message: 'Se ha registrado un nuevo usuario en la plataforma.',
                                timestamp: Date.now()
                            });
                        }

                        // 2. Check for New Rides
                        if (currentStats.total_rides > prev.total_rides) {
                            newNotifs.push({
                                id: Date.now() + 'ride',
                                type: 'ride',
                                title: 'Nuevo Viaje',
                                message: 'Un conductor ha publicado un nuevo viaje.',
                                timestamp: Date.now()
                            });
                        }

                        // 3. New Bookings (Paid)
                        if (currentStats.total_bookings > prev.total_bookings) {
                            newNotifs.push({
                                id: Date.now() + 'booking',
                                type: 'booking',
                                title: 'Nueva Reserva',
                                message: 'Se ha realizado una nueva reserva de viaje.',
                                timestamp: Date.now()
                            });
                        }

                        // 4. Pending User Approvals (Action Required)
                        if (currentStats.pending_users > prev.pending_users) {
                            newNotifs.push({
                                id: Date.now() + 'pending_user',
                                type: 'verification',
                                title: 'Solicitud de Ingreso',
                                message: 'Un usuario requiere aprobación manual para ingresar.',
                                timestamp: Date.now()
                            });
                        }

                        // 5. Pending Verifications (Docs)
                        if (currentStats.pending_verifications > prev.pending_verifications) {
                            newNotifs.push({
                                id: Date.now() + 'pending_verif',
                                type: 'verification',
                                title: 'Verificación Documental',
                                message: 'Un usuario ha subido documentos para verificación.',
                                timestamp: Date.now()
                            });
                        }

                        if (newNotifs.length > 0) {
                            setNotifications(prevNotifs => [...prevNotifs, ...newNotifs]);
                            try {
                                audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
                            } catch (e) {
                                console.error("Error playing sound", e);
                            }
                        }
                    }

                    // Update ref
                    previousStats.current = currentStats;
                }
            } catch (error) {
                console.error("Error polling admin stats:", error);
            }
        };

        // Initial fetch
        checkStats();

        // Interval
        const intervalId = setInterval(checkStats, 30000); // Poll every 30 seconds

        return () => clearInterval(intervalId);
    }, [user]);

    const dismissNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

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

            {/* Toast Notifications */}
            <NotificationToast
                notifications={notifications}
                onDismiss={dismissNotification}
            />
        </div>
    )
}
