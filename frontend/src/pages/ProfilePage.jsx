import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '@config/api.js'

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

    const handleUpdate = async (e, forceRole = null) => {
        if (e && e.preventDefault) e.preventDefault()

        const payload = { ...formData }
        if (forceRole) payload.role = forceRole

        try {
            const res = await authFetch(`${API_URL}/users/me`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
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

        // Validations
        if (file.size > 5 * 1024 * 1024) {
            alert("❌ El archivo es muy pesado (>5MB). Intenta con uno más liviano.")
            return
        }

        const formData = new FormData()
        // Force filename to ensure multipart parser recognizes it as a file upload
        formData.append('file', file, file.name || "dni.jpg")

        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            console.log("📤 Uploading:", file.name, file.type, file.size)

            const res = await fetch(`${API_URL}/users/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Explicitly NO Content-Type to let browser set boundary
                },
                body: formData
            })

            console.log("📥 Response status:", res.status)

            if (res.ok) {
                setSuccessMsg('Documento enviado. Un admin revisará tu solicitud. ⏳')
                fetchProfile()
            } else {
                const errText = await res.text()
                console.error("❌ Upload error body:", errText)
                try {
                    const err = JSON.parse(errText)
                    // Handling standard FastAPI/Pydantic errors
                    if (Array.isArray(err.detail)) {
                        alert(`Error de validación: ${err.detail[0]?.msg || JSON.stringify(err.detail)}`)
                    } else {
                        alert(err.detail || "Error al subir documento")
                    }
                } catch (e) {
                    alert(`Error inesperado: ${errText}`)
                }
            }
        } catch (error) {
            console.error("❌ Network Exception:", error)
            alert('Error de conexión: ' + error.message)
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

    const handleLicenseUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/users/me/license`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (res.ok) {
                const updatedUser = await res.json()
                setProfile(updatedUser)
                setSuccessMsg('Licencia subida correctamente 🚙')
                setTimeout(() => setSuccessMsg(''), 3000)
            } else {
                const err = await res.json()
                alert(err.detail || 'Error al subir licencia')
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

                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-lg font-bold text-white mb-4">Documentación del Conductor</h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <label className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-cyan-500 transition group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl opacity-50 group-hover:opacity-100">🚙</span>
                                        <div className="text-left">
                                            <p className="font-bold text-white">Licencia de Conducir</p>
                                            <p className="text-xs text-slate-500">{profile?.driver_license ? 'Licencia Cargada ✅' : 'Subir foto de licencia'}</p>
                                        </div>
                                    </div>
                                    <span className="text-cyan-500 text-sm font-bold">{profile?.driver_license ? 'CAMBIAR' : 'SUBIR'}</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLicenseUpload}
                                    />
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
                        {profile?.verification_status === 'verified' ? (
                            <div className="space-y-4 animate-in zoom-in duration-300">
                                <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">✅</div>
                                <h2 className="text-2xl font-black text-white">¡Identidad Verificada!</h2>
                                <p className="text-slate-400">Tu perfil cuenta con la insignia oficial de confianza.</p>
                            </div>
                        ) : profile?.verification_status === 'pending' ? (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                <div className="w-24 h-24 bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto text-5xl border-2 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                    ⏳
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">Solicitud en Revisión</h2>
                                    <p className="text-yellow-200/80 mt-2 max-w-lg mx-auto font-medium">
                                        Hemos recibido tu documentación. Un administrador revisará tus datos a la brevedad.
                                    </p>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 max-w-md mx-auto">
                                    <p className="text-xs text-slate-500">
                                        ℹ️ Te notificaremos cuando el proceso finalice. No es necesario que subas el archivo nuevamente.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-4xl border border-slate-700">
                                    🛡️
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">Verifica tu Identidad</h2>
                                    <p className="text-slate-400 mt-2 max-w-lg mx-auto">
                                        Para mantener la seguridad de la comunidad, necesitamos validar tu DNI.
                                    </p>
                                    <div className="bg-yellow-900/10 border border-yellow-500/20 p-3 rounded-lg mt-3 inline-block">
                                        <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">
                                            ⚠️ Importante: Tus datos serán sometidos a revisión manual
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 max-w-md mx-auto py-6">
                                    <label className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-cyan-500 transition group cursor-pointer relative overflow-hidden">
                                        <div className="flex items-center gap-3 relative z-10">
                                            <span className="text-2xl opacity-50 group-hover:opacity-100 transition">📄</span>
                                            <div className="text-left">
                                                <p className="font-bold text-white group-hover:text-cyan-400 transition">Documento de Identidad (DNI)</p>
                                                <p className="text-xs text-slate-500">Sube una foto clara (Frente). <span className="text-cyan-500 font-bold">Formatos: JPG, PNG</span></p>
                                            </div>
                                        </div>
                                        <span className="bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded-lg text-xs font-bold uppercase border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-white transition">SUBIR</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg, image/png, image/jpg"
                                            onChange={handleVerifyUpload}
                                        />
                                    </label>
                                </div>

                                <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30">
                                    <p className="text-xs text-blue-200">
                                        🛡️ <strong>Confidencialidad Garantizada:</strong> Tus documentos personales no serán visibles para otros usuarios. Solo se utilizan para validar que eres una persona real.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    )
}
