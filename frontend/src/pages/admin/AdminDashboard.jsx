import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '@config/api.js'

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="text-white">Cargando estadísticas...</div>

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Dashboard General</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-2">
                    <span className="text-slate-400 text-sm font-bold uppercase">Total Usuarios</span>
                    <span className="text-4xl font-black text-white">{stats?.total_users}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-2">
                    <span className="text-slate-400 text-sm font-bold uppercase">Viajes Totales</span>
                    <span className="text-4xl font-black text-cyan-400">{stats?.total_rides}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-2">
                    <span className="text-slate-400 text-sm font-bold uppercase">Viajes Activos</span>
                    <span className="text-4xl font-black text-green-400">{stats?.active_rides}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="text-6xl">💰</span>
                    </div>
                    <span className="text-slate-400 text-sm font-bold uppercase">Ingresos (Estimados)</span>
                    <span className="text-4xl font-black text-yellow-400">${stats?.total_revenue?.toLocaleString()}</span>
                </div>
            </div>

            {/* Pending Approvals Widget */}
            {stats?.users_preview?.some(u => !u.is_active) && (
                <div className="bg-yellow-900/10 border border-yellow-600/30 rounded-2xl overflow-hidden animate-pulse-slow">
                    <div className="p-4 border-b border-yellow-600/30 flex justify-between items-center bg-yellow-900/20">
                        <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                            ⚠️ Solicitudes de Ingreso Pendientes
                        </h2>
                        <Link to="/admin/users" className="text-xs text-yellow-400 hover:text-white font-bold border border-yellow-400 px-3 py-1 rounded-full uppercase">
                            Gestionar
                        </Link>
                    </div>
                    <div className="p-4">
                        <p className="text-slate-400 text-sm">Hay usuarios nuevos esperando aprobación para acceder a la plataforma.</p>
                    </div>
                </div>
            )}

            {/* Recent Activity / Users Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Usuarios Recientes</h2>
                    <Link to="/admin/users" className="text-sm text-cyan-400 hover:text-cyan-300 font-bold">Ver Todos</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Rol</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Registro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300 text-sm">
                            {stats?.users_preview?.map(user => (
                                <tr key={user.id} className="hover:bg-slate-800/50 transition">
                                    <td className="p-4 font-mono text-slate-500">#{user.id}</td>
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs overflow-hidden">
                                            {user.profile_picture ? (
                                                <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>👤</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-900 text-purple-200' :
                                            user.role === 'C' ? 'bg-cyan-900 text-cyan-200' :
                                                'bg-slate-800 text-slate-300'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {user.is_active ? (
                                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2"></span>
                                        ) : (
                                            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block mr-2" title="Pending Approval"></span>
                                        )}
                                        {user.is_verified ? (
                                            <span className="text-green-400 font-bold text-xs uppercase">Verificado</span>
                                        ) : (
                                            <span className="text-slate-500 text-xs">Pendiente</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {new Date(user.created_at || Date.now()).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
