import React, { useEffect, useState } from 'react'
import { API_URL } from '@config/api.js'

export default function AdminVerifications() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        fetchPendingUsers()
    }, [])

    const fetchPendingUsers = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/admin/users?verification_status=pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (status) => {
        if (!selectedUser) return
        if (!confirm(`¿Estás seguro de ${status === 'approved' ? 'APROBAR' : 'RECHAZAR'} a este usuario?`)) return

        setProcessing(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/admin/users/${selectedUser.id}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            })

            if (res.ok) {
                alert(`Usuario ${status === 'approved' ? 'Verificado' : 'Rechazado'} correctamente.`)
                setSelectedUser(null)
                fetchPendingUsers()
            } else {
                alert('Error al procesar la solicitud.')
            }
        } catch (error) {
            console.error(error)
            alert('Error de conexión')
        } finally {
            setProcessing(false)
        }
    }

    if (loading) return <div className="text-white">Cargando solicitudes...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Cola de Verificación 🛡️</h1>

            {users.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-2xl text-center text-slate-500">
                    <p className="text-xl">✅ No hay solicitudes pendientes.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {users.map(user => (
                        <div key={user.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
                                    {user.profile_picture ? (
                                        <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="flex items-center justify-center h-full text-2xl">👤</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{user.name}</h3>
                                    <p className="text-sm text-slate-400">{user.email}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${user.role === 'C' ? 'bg-cyan-900 text-cyan-200' : 'bg-pink-900 text-pink-200'}`}>
                                            {user.role === 'C' ? 'Conductor' : 'Pasajero'}
                                        </span>
                                        <span className="text-xs text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded uppercase font-bold">Pendiente</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedUser(user)}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-xl transition shadow-lg shadow-cyan-900/20 whitespace-nowrap"
                            >
                                Revisar Documentos 🔍
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Revisión */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-10 relative animate-fade-in-up">
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center transition"
                        >
                            ×
                        </button>

                        <div className="flex flex-col gap-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-black text-white">Revisión de Identidad</h2>
                                <p className="text-slate-400">Verifica que los datos coincidan.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* DNI */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Documento de Identidad</h3>
                                    {selectedUser.verification_document ? (
                                        <div className="rounded-xl overflow-hidden border border-slate-700 bg-black">
                                            <img src={selectedUser.verification_document} alt="DNI" className="w-full h-auto object-contain max-h-[400px]" />
                                        </div>
                                    ) : (
                                        <div className="bg-slate-950 rounded-xl p-10 text-center text-slate-500 border border-slate-800 border-dashed">
                                            ⚠️ No subió DNI
                                        </div>
                                    )}
                                </div>

                                {/* Licencia (Solo Conductores) */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2 flex justify-between">
                                        Licencia de Conducir
                                        {selectedUser.driver_license && <span className="text-xs bg-cyan-900 text-cyan-200 px-2 py-1 rounded">CONDUCTOR</span>}
                                    </h3>
                                    {selectedUser.driver_license ? (
                                        <div className="rounded-xl overflow-hidden border border-slate-700 bg-black">
                                            <img src={selectedUser.driver_license} alt="Licencia" className="w-full h-auto object-contain max-h-[400px]" />
                                        </div>
                                    ) : (
                                        <div className="bg-slate-950 rounded-xl p-10 text-center text-slate-500 border border-slate-800 border-dashed">
                                            {selectedUser.role === 'C' ? '⚠️ Conductor SIN Licencia' : 'ℹ️ No requerido (Pasajero)'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-6 border-t border-slate-800 justify-end">
                                <button
                                    onClick={() => handleVerify('rejected')}
                                    disabled={processing}
                                    className="bg-red-900/50 hover:bg-red-900 text-red-200 font-bold py-3 px-8 rounded-xl border border-red-500/30 transition shadow-lg shadow-red-900/20 disabled:opacity-50"
                                >
                                    ❌ RECHAZAR
                                </button>
                                <button
                                    onClick={() => handleVerify('approved')}
                                    disabled={processing}
                                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-900/20 transition disabled:opacity-50"
                                >
                                    ✅ APROBAR VERIFICACIÓN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
