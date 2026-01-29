import { useState, useEffect, useRef } from 'react'

export default function ProfileModal({ isOpen, onClose, user, API_URL, authFetch, onUpdate }) {
    if (!isOpen) return null

    // --- STATE ---
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(false)

    // Photo handling
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        dni: '',
        phone: '',
        name: '',
        email: '',
        gender: 'O',
        birth_date: '',
        address: '',

        // Driver
        car_model: '',
        car_plate: '',
        car_color: '',

        // Prefs
        prefs_smoking: false,
        prefs_pets: false,
        prefs_luggage: true
    })

    // --- HELPERS ---
    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const difference = Date.now() - birthDate.getTime();
        const ageDate = new Date(difference);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }



    const toTitleCase = (str) => {
        if (!str) return ""
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
    }

    // --- EFFECT: LOAD USER DATA ---
    useEffect(() => {
        if (user) {
            setFormData({
                dni: user.dni || '',
                phone: user.phone || '',
                name: toTitleCase(user.name) || '',
                email: user.email || '',
                gender: user.gender || 'O',
                birth_date: user.birth_date || '',
                address: toTitleCase(user.address) || '',

                car_model: user.car_model || '',
                car_plate: (user.car_plate || '').toUpperCase(),
                car_color: user.car_color || '',

                prefs_smoking: user.prefs_smoking || false,
                prefs_pets: user.prefs_pets || false,
                prefs_luggage: user.prefs_luggage !== undefined ? user.prefs_luggage : true,
            })
            setPhotoPreview(user.profile_picture || user.avatar_url || null) // Handle various image keys
        }
    }, [user])

    // --- HANDLERS ---

    // Change Input
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        let val = type === 'checkbox' ? checked : value

        // Specific formatters
        if (name === 'phone') {
            // Allow typing only numbers and + 
            val = value.replace(/[^0-9+]/g, '')
        }
        if (name === 'car_plate') {
            val = value.toUpperCase()
        }


        setFormData(prev => ({ ...prev, [name]: val }))
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        if (['name', 'address', 'car_model', 'car_color'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: toTitleCase(value) }))
        }
    }

    // Photo Selection
    const handlePhotoSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setPhotoFile(file)
            setPhotoPreview(URL.createObjectURL(file))
        }
    }

    // TABS NAVIGATION
    const TABS = user?.role === 'C' ? ['general', 'conductor', 'prefs'] : ['general']

    const handleNext = () => {
        const idx = TABS.indexOf(activeTab)
        if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1])
    }

    const handlePrev = () => {
        const idx = TABS.indexOf(activeTab)
        if (idx > 0) setActiveTab(TABS[idx - 1])
    }

    // SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {


            // 1. Upload Photo if changed
            if (photoFile) {

                const photoData = new FormData()
                photoData.append('file', photoFile)

                // Need to use authFetch or standard fetch with headers?
                // authFetch usually adds Content-Type: application/json. For Multipart we need to let browser set boundary.
                // Assuming authFetch can handle this if we don't set Content-Type manually, OR we use token manually.
                // Let's try grabbing token from localStorage for safety or relying on authFetch if it's smart.
                // Safest bet: Manual fetch with token.
                const token = localStorage.getItem('token')

                const photoRes = await fetch(`${API_URL}/users/me/photo`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                        // NO Content-Type header so browser sets boundary
                    },
                    body: photoData
                })

                if (!photoRes.ok) throw new Error("Error subiendo foto")

            }

            // 2. Update Data

            const response = await authFetch(`${API_URL}/users/me`, {
                method: 'PATCH',
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const updatedUser = await response.json()
                onUpdate(updatedUser) // Update parent state
                alert("✅ ¡Perfil actualizado correctamente!")
                setIsEditing(false) // Exit edit mode
                setPhotoFile(null) // Reset pending photo
            } else {
                const err = await response.json()
                throw new Error(err.detail || "Error al guardar datos")
            }

        } catch (error) {

            alert(`❌ Algo salió mal: ${error.message}`)
        }
        setLoading(false)
    }

    // --- RENDER HELPERS ---
    const inputBase = "w-full bg-slate-950 border rounded-lg p-3 text-sm text-white focus:outline-none transition "
    const inputEnabled = "border-slate-700 focus:border-cyan-500"
    const inputDisabled = "border-transparent bg-slate-900/50 text-slate-400 cursor-not-allowed"

    const getInputClass = (enabled = true) => `${inputBase} ${isEditing && enabled ? inputEnabled : inputDisabled}`
    const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>👤</span> Mi Perfil
                    </h2>
                    <div className="flex gap-3">
                        {/* EDIT TOGGLE */}
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-1 bg-cyan-900/30 text-cyan-400 rounded-full text-xs font-bold border border-cyan-500/30 hover:bg-cyan-900/50 transition">
                                ✏️ EDITAR DATOS
                            </button>
                        ) : (
                            <span className="text-xs font-bold text-yellow-500 animate-pulse uppercase flex items-center gap-1">
                                🔓 Modo Edición
                            </span>
                        )}
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition text-xl">✖</button>
                    </div>
                </div>

                {/* PHOTO & SUMMARY (Sticky Top) */}
                <div className="p-6 pb-0 flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-lg">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                            )}
                        </div>
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full cursor-pointer"
                            >
                                <span className="text-xs font-bold text-white uppercase text-center">Cambiar<br />Foto</span>
                            </button>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} className="hidden" accept="image/*" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white leading-none">{formData.name || 'Usuario'}</h3>
                        <p className="text-sm text-cyan-400 font-bold uppercase tracking-wider mt-1 mb-2">{user?.role === 'C' ? 'Conductor' : 'Pasajero'}</p>

                        {/* Stats Badges */}
                        <div className="flex gap-2">
                            <span className="bg-slate-800 px-2 py-1 rounded-md text-[10px] uppercase font-bold text-slate-400 border border-slate-700">
                                ⭐ {user.reputation_score || 100} Rep.
                            </span>
                            <span className="bg-slate-800 px-2 py-1 rounded-md text-[10px] uppercase font-bold text-slate-400 border border-slate-700">
                                🎂 {calculateAge(formData.birth_date)} Años
                            </span>
                        </div>
                    </div>
                </div>

                {/* TABS HEADER */}
                <div className="mt-6 flex px-6 border-b border-slate-800">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-4 text-xs font-bold uppercase tracking-widest transition border-b-2 ${activeTab === tab ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab === 'prefs' ? 'Preferencias' : tab}
                        </button>
                    ))}
                </div>

                {/* SCROLLABLE FORM BODY */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative">
                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">

                        {activeTab === 'general' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className={labelClass}>Nombre Completo</label>
                                    <input name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} className={getInputClass()} placeholder="Tu nombre real" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>DNI (Fijo)</label>
                                        <input name="dni" value={formData.dni} disabled className={getInputClass(false)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Sexo / Género</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing} className={getInputClass()}>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                            <option value="O">Otro</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Nacimiento</label>
                                        <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} disabled={!isEditing} className={getInputClass()} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>WhatsApp / Teléfono</label>
                                        <input name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className={getInputClass()} placeholder="+54 9..." />
                                        {isEditing && <p className="text-[10px] text-slate-500 mt-1">Formato: +54 9 11 1234 5678</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Email</label>
                                    <input name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className={getInputClass()} />
                                </div>

                                <div>
                                    <label className={labelClass}>Barrio / Dirección</label>
                                    <input name="address" value={formData.address} onChange={handleChange} onBlur={handleBlur} disabled={!isEditing} className={getInputClass()} placeholder="Ej: Nueva Córdoba" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'conductor' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-xl mb-4">
                                    <p className="text-cyan-200 text-xs text-center">🚗 Tu vehículo es tu carta de presentación.</p>
                                </div>
                                <div>
                                    <label className={labelClass}>Marca y Modelo</label>
                                    <input name="car_model" value={formData.car_model} onChange={handleChange} onBlur={handleBlur} disabled={!isEditing} className={getInputClass()} placeholder="Ej: Fiat Cronos 1.3" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Patente</label>
                                        <input name="car_plate" value={formData.car_plate} onChange={handleChange} disabled={!isEditing} className={getInputClass()} placeholder="AA 123 BB" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Color</label>
                                        <input name="car_color" value={formData.car_color} onChange={handleChange} onBlur={handleBlur} disabled={!isEditing} className={getInputClass()} placeholder="Blanco" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'prefs' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { key: 'prefs_smoking', emoji: '🚬', label: 'Permitido Fumar' },
                                        { key: 'prefs_pets', emoji: '🐾', label: 'Permite Mascotas' },
                                        { key: 'prefs_luggage', emoji: '🧳', label: 'Lugar para Equipaje' },
                                    ].map(pref => (
                                        <label key={pref.key} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${isEditing ? 'border-slate-700 bg-slate-900 hover:border-cyan-500/50' : 'border-slate-800 bg-slate-900/50 opacity-70'}`}>
                                            <span className="text-sm font-bold text-slate-300">{pref.emoji} {pref.label}</span>
                                            <input
                                                type="checkbox"
                                                name={pref.key}
                                                checked={formData[pref.key]}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                className="w-5 h-5 accent-cyan-500"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                    </form>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-5 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center z-10">

                    {/* LEFT: Navigation */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handlePrev}
                            disabled={TABS.indexOf(activeTab) === 0}
                            className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={TABS.indexOf(activeTab) === TABS.length - 1}
                            className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
                        >
                            →
                        </button>
                    </div>

                    {/* RIGHT: Save Actions */}
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-white transition uppercase tracking-wider">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    form="profile-form"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-2 px-6 rounded-xl shadow-lg shadow-emerald-900/20 transition transform active:scale-95 text-xs uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>⏳ Guardando...</>
                                    ) : (
                                        <>💾 Guardar Cambios</>
                                    )}
                                </button>
                            </>
                        ) : (
                            <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-white transition uppercase tracking-wider">
                                Cerrar
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
