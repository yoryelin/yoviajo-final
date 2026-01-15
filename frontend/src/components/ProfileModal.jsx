import { useState, useEffect } from 'react'

export default function ProfileModal({ isOpen, onClose, user, API_URL, authFetch, onUpdate }) {
    if (!isOpen) return null

    // Estado local para los campos (se inicializa con los datos del usuario)
    const [formData, setFormData] = useState({
        profile: {
            dni: '', phone_number: '', biography: '',
            car_model: '', car_plate: '',
            pref_smoking: false, pref_pets: false,
            pref_luggage: 'NONE', pref_women_only: false
        }
    })

    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(false)

    // Cargar datos cuando se abre
    useEffect(() => {
        if (user && user.profile) {
            setFormData({ profile: { ...user.profile } })
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        const val = type === 'checkbox' ? checked : value

        setFormData(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                [name]: val
            }
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await authFetch(`${API_URL}/users/me/`, {
                method: 'PATCH',
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const updatedUser = await response.json()
                onUpdate(updatedUser) // Actualizar estado global
                alert("✅ Perfil actualizado")
                onClose()
            } else {
                alert("❌ Error al guardar perfil")
            }
        } catch (error) {
            console.error(error)
            alert("❌ Error de conexión")
        }
        setLoading(false)
    }

    // Clases CSS reutilizables
    const inputClass = "w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none transition"
    const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1"
    const tabClass = (tab) => `flex-1 py-3 text-xs font-bold uppercase tracking-widest transition border-b-2 ${activeTab === tab ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>👤</span> Editar Perfil
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition">✖</button>
                </div>

                {/* TABS */}
                <div className="flex bg-slate-950/30">
                    <button onClick={() => setActiveTab('general')} className={tabClass('general')}>General</button>
                    <button onClick={() => setActiveTab('conductor')} className={tabClass('conductor')}>Conductor</button>
                    <button onClick={() => setActiveTab('prefs')} className={tabClass('prefs')}>Preferencias</button>
                </div>

                {/* BODY (Scrollable) */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* --- TAB: GENERAL --- */}
                        {activeTab === 'general' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Stats Card */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                                        <div className="text-3xl font-black text-yellow-400">{user.reputation_score || 100}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prestigio</div>
                                    </div>
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
                                        <div className="text-3xl font-black text-red-400">{user.cancellation_count || 0}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cancelaciones</div>
                                    </div>
                                </div>

                                <div>

                                    <label className={labelClass}>DNI</label>
                                    <input name="dni" value={formData.profile.dni || ''} onChange={handleChange} className={inputClass} placeholder="Documento de Identidad" />
                                </div>
                                <div>
                                    <label className={labelClass}>WhatsApp / Celular</label>
                                    <input name="phone_number" value={formData.profile.phone_number || ''} onChange={handleChange} className={inputClass} placeholder="+54 9 11 ..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Biografía</label>
                                    <textarea name="biography" value={formData.profile.biography || ''} onChange={handleChange} className={inputClass} rows="3" placeholder="Cuéntanos algo sobre ti..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Género</label>
                                    <select name="gender" value={formData.profile.gender || 'O'} onChange={handleChange} className={inputClass}>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                        <option value="O">Otro</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: CONDUCTOR --- */}
                        {activeTab === 'conductor' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-xl mb-4">
                                    <p className="text-cyan-200 text-xs">🚗 Completa estos datos solo si vas a publicar viajes.</p>
                                </div>
                                <div>
                                    <label className={labelClass}>Modelo del Auto</label>
                                    <input name="car_model" value={formData.profile.car_model || ''} onChange={handleChange} className={inputClass} placeholder="Ej: VW Gol Trend Rojo" />
                                </div>
                                <div>
                                    <label className={labelClass}>Patente</label>
                                    <input name="car_plate" value={formData.profile.car_plate || ''} onChange={handleChange} className={inputClass} placeholder="AA 123 BB" />
                                </div>
                                <div className="flex items-center gap-3 p-3 border border-slate-700 rounded-xl bg-slate-950/30">
                                    <input type="checkbox" name="insurance_verified" checked={formData.profile.insurance_verified || false} onChange={handleChange} className="w-5 h-5 accent-cyan-500" />
                                    <label className="text-sm font-bold text-slate-300">Declaro tener Seguro Vigente y al día</label>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: PREFERENCIAS --- */}
                        {activeTab === 'prefs' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center justify-between p-4 border border-slate-700 rounded-xl bg-slate-950/30">
                                        <span className="text-sm font-bold text-slate-300">🚬 Permitido Fumar</span>
                                        <input type="checkbox" name="pref_smoking" checked={formData.profile.pref_smoking || false} onChange={handleChange} className="w-5 h-5 accent-cyan-500" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border border-slate-700 rounded-xl bg-slate-950/30">
                                        <span className="text-sm font-bold text-slate-300">🐾 Mascotas Permitidas</span>
                                        <input type="checkbox" name="pref_pets" checked={formData.profile.pref_pets || false} onChange={handleChange} className="w-5 h-5 accent-cyan-500" />
                                    </div>
                                    <div className="p-4 border border-slate-700 rounded-xl bg-slate-950/30">
                                        <span className="text-sm font-bold text-slate-300 block mb-2">🧳 Equipaje Permitido</span>
                                        <select name="pref_luggage" value={formData.profile.pref_luggage || 'NONE'} onChange={handleChange} className={inputClass}>
                                            <option value="NONE">Sin Equipaje</option>
                                            <option value="SMALL">Mochila / Bolso</option>
                                            <option value="LARGE">Valija Grande</option>
                                        </select>
                                    </div>

                                    {/* Filtro Solo Mujeres (Solo visible si es Femenino) */}
                                    {formData.profile.gender === 'F' && (
                                        <div className="flex items-center justify-between p-4 border border-pink-500/30 bg-pink-500/5 rounded-xl">
                                            <span className="text-sm font-bold text-pink-300">👩 Solo Mujeres</span>
                                            <input type="checkbox" name="pref_women_only" checked={formData.profile.pref_women_only || false} onChange={handleChange} className="w-5 h-5 accent-pink-500" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </form>
                </div>

                {/* FOOTER */}
                <div className="p-5 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-white transition uppercase tracking-wider">Cancelar</button>
                    <button
                        type="submit"
                        form="profile-form"
                        disabled={loading}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-2 px-6 rounded-xl shadow-lg shadow-cyan-900/20 transition transform active:scale-95 text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

            </div>
        </div>
    )
}
