import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
    const { user, login } = useAuth() // login actually updates user state if we pass full user object? Use a refresh function if available or just re-fetch.
    // AuthContext doesn't have a 'refreshUser'. We might need to manually call an endpoint or just update local state.
    // Let's assume we fetch /api/users/me current data on mount.
    const navigate = useNavigate()

    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('info') // info, car, verify

    // Form States
    const [formData, setFormData] = useState({})
    const [successMsg, setSuccessMsg] = useState('')

    const RAW_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8003'
    const API_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`

    const authFetch = async (url, options = {}) => {
        const token = localStorage.getItem('token')
        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        })
    }

    const fetchProfile = async () => {
        try {
            const res = await authFetch(`${API_URL}/users/me`)
            if (res.ok) {
                const data = await res.json()
                setProfile(data)
                setFormData(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const handleUpdate = async (e) => {
        e.preventDefault()
        try {
            const res = await authFetch(`${API_URL}/users/me`, {
                method: 'PATCH',
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setSuccessMsg('Perfil actualizado correctamente ✅')
                setTimeout(() => setSuccessMsg(''), 3000)
                fetchProfile()
            } else {
                alert('Error al actualizar')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleVerifyUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!confirm('¿Estás seguro de enviar este documento para verificación?')) return

        const formData = new FormData()
        formData.append('file', file)

        setLoading(true)
        try {
            const res = await authFetch(`${API_URL}/users/verify`, {
                method: 'POST',
                body: formData
            })
            if (res.ok) {
                setSuccessMsg('Documento enviado. Un admin revisará tu solicitud. ⏳')
                fetchProfile()
            } else {
                const err = await res.json()
                alert(err.detail || 'Error al subir documento')
            }
        } catch (error) {
            console.error(error)
            alert('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona una imagen válida.')
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/users/me/photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (res.ok) {
                const updatedUser = await res.json()
                setProfile(updatedUser)
                setSuccessMsg('Foto actualizada correctamente 📸')
                setTimeout(() => setSuccessMsg(''), 3000)
            } else {
                const err = await res.json()
                alert(err.detail || 'Error al subir imagen')
            }
        } catch (error) {
            console.error(error)
            alert('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-10 text-center text-white">Cargando perfil...</div>

    const isDriver = profile?.role === 'C'

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in pb-24">
            {/* Header */}
            <div className="flex items-center gap-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <div className="relative group">
                    <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-4xl shadow-xl shadow-cyan-900/40 overflow-hidden border-4 border-slate-800 relative">
                        {profile?.profile_picture ? (
                            <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>{profile?.gender === 'F' ? '👩' : (profile?.gender === 'M' ? '👨' : '👤')}</span>
                        )}

                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-xs font-bold rounded-full">
                            CAMBIAR
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </label>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-white">{profile?.name}</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isDriver ? 'bg-cyan-900 text-cyan-200' : 'bg-pink-900 text-pink-200'}`}>
                            {isDriver ? 'Conductor' : 'Pasajero'}
                        </span>
                        {profile?.is_verified && (
                            <span className="flex items-center gap-1 bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-green-500/30">
                                ✅ Verificado
                            </span>
                        )}
                        {profile?.gender === 'F' && (
                            <span className="flex items-center gap-1 bg-pink-900/50 text-pink-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-pink-500/30">
                                🌸 Conductora
                            </span>
                        )}
                    </div>

                    <button
                        onClick={() => document.getElementById('photo-upload-input').click()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-lg transition mt-2 border border-blue-400"
                    >
                        <span>📷 CAMBIAR FOTO</span>
                    </button>
                    <input
                        id="photo-upload-input"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'info' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-white'}`}
                >
                    Mis Datos
                </button>
                {
                    isDriver && (
                        <button
                            onClick={() => setActiveTab('car')}
                            className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'car' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-white'}`}
                        >
                            Mi Vehículo
                        </button>
                    )
                }
                <button
                    onClick={() => setActiveTab('verify')}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'verify' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-white'}`}
                >
                    Verificación
                </button>
            </div >

            {
                successMsg && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl font-bold flex items-center gap-2">
                        ✅ {successMsg}
                    </div>
                )
            }

            {/* Content Info */}
            {
                activeTab === 'info' && (
                    <form onSubmit={handleUpdate} className="grid gap-6 md:grid-cols-2 bg-slate-900/30 p-6 rounded-2xl border border-white/5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                            <input type="text" value={profile?.email} disabled className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-400 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">WhatsApp / Teléfono</label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                placeholder="Ej: 5491112345678 (Sin guiones)"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Solo se compartirá con quien confirmes viaje.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">DNI</label>
                            <input type="text" value={profile?.dni} disabled className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-400 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={formData.birth_date || ''}
                                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Dirección</label>
                            <input
                                type="text"
                                value={formData.address || ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Calle 123, Mar del Plata"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-cyan-900/20 transition">
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                )
            }

            {/* Content Car */}
            {
                activeTab === 'car' && (
                    <form onSubmit={handleUpdate} className="space-y-6 bg-slate-900/30 p-6 rounded-2xl border border-white/5">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div>
                                <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Modelo</label>
                                <input
                                    type="text"
                                    value={formData.car_model || ''}
                                    onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
                                    placeholder="Ej: Toyota Corolla"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Patente</label>
                                <input
                                    type="text"
                                    value={formData.car_plate || ''}
                                    onChange={(e) => setFormData({ ...formData, car_plate: e.target.value })}
                                    placeholder="AA 123 BB"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-cyan-400 uppercase mb-2">Color</label>
                                <input
                                    type="text"
                                    value={formData.car_color || ''}
                                    onChange={(e) => setFormData({ ...formData, car_color: e.target.value })}
                                    placeholder="Ej: Blanco Perla"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-lg font-bold text-white mb-4">Preferencias de Viaje</h3>
                            <div className="flex gap-6 flex-wrap">
                                <label className="flex items-center gap-3 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-cyan-500 transition px-6">
                                    <input
                                        type="checkbox"
                                        checked={formData.prefs_smoking || false}
                                        onChange={(e) => setFormData({ ...formData, prefs_smoking: e.target.checked })}
                                        className="w-5 h-5 accent-cyan-500"
                                    />
                                    <span className="text-sm font-bold text-slate-300">🚬 Permitido Fumar</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-cyan-500 transition px-6">
                                    <input
                                        type="checkbox"
                                        checked={formData.prefs_pets || false}
                                        onChange={(e) => setFormData({ ...formData, prefs_pets: e.target.checked })}
                                        className="w-5 h-5 accent-cyan-500"
                                    />
                                    <span className="text-sm font-bold text-slate-300">🐶 Mascotas OK</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-cyan-500 transition px-6">
                                    <input
                                        type="checkbox"
                                        checked={formData.prefs_luggage !== false} // Default true
                                        onChange={(e) => setFormData({ ...formData, prefs_luggage: e.target.checked })}
                                        className="w-5 h-5 accent-cyan-500"
                                    />
                                    <span className="text-sm font-bold text-slate-300">🧳 Equipaje Grande</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-cyan-900/20 transition">
                                Actualizar Vehículo
                            </button>
                        </div>
                    </form>
                )
            }

            {/* Content Verify */}
            {
                activeTab === 'verify' && (
                    <div className="bg-slate-900/30 p-8 rounded-2xl border border-white/5 text-center">
                        {profile?.is_verified ? (
                            <div className="space-y-4">
                                <div className="text-6xl">✅</div>
                                <h2 className="text-2xl font-black text-white">¡Tu identidad está Verificada!</h2>
                                <p className="text-slate-400">Ahora tienes acceso a todas las funcionalidades de seguridad y el Badge verificado en tus viajes.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-4xl border border-slate-700">
                                    🛡️
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">Verifica tu Identidad</h2>
                                    <p className="text-slate-400 mt-2 max-w-lg mx-auto">
                                        Para aumentar la confianza en la comunidad, necesitamos validar tu DNI y Licencia de Conducir.
                                    </p>
                                </div>

                                <div className="grid gap-4 max-w-md mx-auto py-6">
                                    <button className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-cyan-500 transition group">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl opacity-50 group-hover:opacity-100">📄</span>
                                            <div className="text-left">
                                                <p className="font-bold text-white">Foto del DNI (Frente)</p>
                                                <p className="text-xs text-slate-500">Pendiente de carga</p>
                                            </div>
                                        </div>
                                        <span className="text-cyan-500 text-sm font-bold">SUBIR</span>
                                    </button>
                                    {isDriver && (
                                        <button className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-cyan-500 transition group">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl opacity-50 group-hover:opacity-100">🚙</span>
                                                <div className="text-left">
                                                    <p className="font-bold text-white">Licencia de Conducir</p>
                                                    <p className="text-xs text-slate-500">Pendiente de carga</p>
                                                </div>
                                            </div>
                                            <span className="text-cyan-500 text-sm font-bold">SUBIR</span>
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={handleVerify}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black py-4 px-10 rounded-xl shadow-lg shadow-green-900/20 transition transform active:scale-[0.98]"
                                >
                                    SOLICITAR VERIFICACIÓN
                                </button>
                                <p className="text-xs text-slate-500">
                                    Al hacer clic, simularás el envío de documentos para esta Demo.
                                </p>
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    )
}
