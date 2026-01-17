import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()

  // Modos: 'login' | 'register' | 'select_role'
  const [viewMode, setViewMode] = useState('login')

  const [formData, setFormData] = useState({
    dni: '', password: '', name: '', role: 'P', email: '', gender: 'M',
    birth_date: '', address: '',
    car_model: '', car_plate: '', car_color: '',
    prefs_smoking: false, prefs_pets: false, prefs_luggage: true,
    check_license: false, check_insurance: false
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Para manejar el caso de múltiples roles
  const [availableRoles, setAvailableRoles] = useState([])

  // API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8003/api'

  const handleSubmit = async (e, forcedRole = null) => {
    if (e) e.preventDefault()
    setError(null)
    setLoading(true)

    // Validacion básica
    if (!formData.dni || !formData.password) {
      setError("Por favor completa DNI y Contraseña.")
      setLoading(false)
      return
    }

    // Validación de formato
    if (formData.dni.length < 7 || formData.dni.length > 8) {
      setError("El DNI debe tener entre 7 y 8 números.")
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      setLoading(false)
      return
    }

    if (viewMode === 'register') {
      if (!formData.name || !formData.email || !formData.birth_date || !formData.address) {
        setError("Por favor completa todos los datos personales.")
        setLoading(false)
        return
      }

      // Driver Validations
      if (formData.role === 'C') {
        if (!formData.car_model || !formData.car_plate) {
          setError("Conductores deben registrar los datos del vehículo.")
          setLoading(false)
          return
        }
        if (!formData.check_license || !formData.check_insurance) {
          setError("Debes confirmar que tienes Licencia y Seguro vigentes.")
          setLoading(false)
          return
        }
      }

      // Simple email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Por favor ingresa un Email válido.")
        setLoading(false)
        return
      }
    }

    try {
      const isRegister = viewMode === 'register'

      // Normalizar URL base
      const RAW_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8003'
      const API_BASE = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`

      // Endpoints (ya tienen /api en el backend router prefix, pero verifiquemos)
      // Si API_BASE ya es ".../api", entonces endpoints deben ser "/register"
      const endpoint = isRegister ? '/register' : '/login'
      const url = `${API_BASE}${endpoint}`

      // Payload base
      let payload = {
        dni: formData.dni,
        password: formData.password
      }

      if (isRegister) {
        payload = {
          ...payload,
          name: formData.name,
          role: formData.role,
          email: formData.email,
          gender: formData.gender,
          birth_date: formData.birth_date,
          address: formData.address,
          // Driver Specifics
          car_model: formData.car_model,
          car_plate: formData.car_plate,
          car_color: formData.car_color,
          prefs_smoking: formData.prefs_smoking,
          prefs_pets: formData.prefs_pets,
          prefs_luggage: formData.prefs_luggage
        }
      }

      // Si forzamos un rol (caso login con múltiple elección)
      if (forcedRole) {
        payload.role = forcedRole
      }

      console.log("Enviando petición...", payload)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        })
        clearTimeout(timeoutId);

        console.log("Respuesta status:", response.status)
        const data = await response.json()
        console.log("Respuesta body:", data)

        // Login/Registro Exitoso
        if (isRegister) {
          alert("¡Cuenta creada! Por favor inicia sesión.")
          setViewMode('login')
          setFormData({ dni: formData.dni, password: '', name: '', role: 'P', email: '', gender: 'M' })
          setLoading(false)
        } else {
          login(data.user, data.access_token)
          // Don't set loading false here immediately if login redirects or unmounts component
        }
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        throw fetchErr;
      }

    } catch (err) {
      console.error("Error en submit:", err)
      if (err.name === 'AbortError') {
        setError('El servidor tardó demasiado en responder. Intenta de nuevo.');
      } else {
        setError(err.message === 'Failed to fetch' ? 'No hay conexión con el Backend' : err.message)
      }
      setLoading(false)
    }
  }

  // --- RENDERIZADO NORMAL (Login / Register) ---
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10">

        <div className="text-center mb-6">
          <h1 className="text-5xl font-black text-white font-logo tracking-wide mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Yo</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Viajo</span>
            <span className="text-yellow-400 text-4xl transform rotate-12 inline-block">!</span>
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
            {viewMode === 'register' ? 'Crear Identidad' : 'Iniciar Sesión'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>

          {/* CAMPOS DE REGISTRO */}
          {viewMode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Nombre Completo</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Tu nombre real"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* CAMPO EMAIL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Email</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </>
          )}

          {/* CAMPO GÉNERO (Solo Registro) */}
          {viewMode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Género</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'M' })}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition ${formData.gender === 'M' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                  Masculino
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'F' })}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition ${formData.gender === 'F' ? 'border-pink-500 bg-pink-500/10 text-white' : 'border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                  Femenino
                </button>
              </div>
            </div>
          )}

          {/* DATOS EXTENDIDOS (FECHA Y DIRECCIÓN) */}
          {viewMode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Nacimiento</label>
                <input
                  className="input-field w-full"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Barrio / Zona</label>
                <input
                  className="input-field w-full"
                  type="text"
                  placeholder="Ej: Centro"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS DE CONDUCTOR (PREFERENCIAS Y AUTO) */}
          {viewMode === 'register' && formData.role === 'C' && (
            <div className="border border-cyan-500/30 bg-cyan-900/10 rounded-xl p-4 space-y-3 animate-fade-in">
              <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest border-b border-cyan-500/20 pb-2 mb-2">
                🚙 Datos del Vehículo
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Marca y Modelo</label>
                  <input className="input-field text-xs" list="car_models" placeholder="Ej: Fiat Cronos" value={formData.car_model} onChange={(e) => setFormData({ ...formData, car_model: e.target.value })} />
                  <datalist id="car_models">
                    <option value="Fiat Cronos" />
                    <option value="Peugeot 208" />
                    <option value="Toyota Hilux" />
                    <option value="Volkswagen Amarok" />
                    <option value="Ford Ranger" />
                    <option value="Renault Kangoo" />
                    <option value="Chevrolet Tracker" />
                    <option value="Volkswagen Gol Trend" />
                    <option value="Toyota Etios" />
                    <option value="Renault Sandero" />
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Patente</label>
                  <input className="input-field text-xs uppercase" placeholder="AA 123 BB" value={formData.car_plate} onChange={(e) => setFormData({ ...formData, car_plate: e.target.value.toUpperCase() })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Color</label>
                <input className="input-field text-xs" placeholder="Ej: Blanco" value={formData.car_color} onChange={(e) => setFormData({ ...formData, car_color: e.target.value })} />
              </div>

              <div className="flex justify-between items-center py-2 border-t border-cyan-500/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.prefs_smoking} onChange={(e) => setFormData({ ...formData, prefs_smoking: e.target.checked })} className="accent-cyan-500" />
                  <span className="text-xs text-slate-300">🚬 Fuma</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.prefs_pets} onChange={(e) => setFormData({ ...formData, prefs_pets: e.target.checked })} className="accent-cyan-500" />
                  <span className="text-xs text-slate-300">🐾 Mascotas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.prefs_luggage} onChange={(e) => setFormData({ ...formData, prefs_luggage: e.target.checked })} className="accent-cyan-500" />
                  <span className="text-xs text-slate-300">🧳 Baúl</span>
                </label>
              </div>

              <div className="space-y-2 pt-2 border-t border-cyan-500/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.check_license} onChange={(e) => setFormData({ ...formData, check_license: e.target.checked })} className="accent-green-500 w-4 h-4" />
                  <span className="text-[10px] font-bold text-green-400 uppercase"> Licencia Vigente</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.check_insurance} onChange={(e) => setFormData({ ...formData, check_insurance: e.target.checked })} className="accent-green-500 w-4 h-4" />
                  <span className="text-[10px] font-bold text-green-400 uppercase"> Seguro al Día</span>
                </label>
              </div>
            </div>
          )}

          {/* CAMPO DNI (Común) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-1 uppercase">DNI</label>
            <input
              className="w-full bg-slate-950 border border-slate-600 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition font-bold tracking-widest"
              type="number"
              placeholder="Ej: 30123456"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            />
          </div>

          {/* CAMPO PASSWORD (Común) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Contraseña</label>
            <input
              className="w-full bg-slate-950 border border-slate-600 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition font-bold"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* SELECTOR DE ROL (Solo Registro) */}
          {viewMode === 'register' && (
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase block mb-2">¿Cómo vas a participar?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'P' })}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition flex flex-col items-center gap-1 ${formData.role === 'P' ? 'border-pink-500 bg-pink-500/10 text-white' : 'border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                  <span className="text-xl">🙋‍♂️</span> Pasajero
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'C' })}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition flex flex-col items-center gap-1 ${formData.role === 'C' ? 'border-cyan-500 bg-cyan-500/10 text-white' : 'border-slate-700 text-slate-500 hover:border-slate-500'}`}
                >
                  <span className="text-xl">🚗</span> Conductor
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          <button
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-4 rounded-xl shadow-lg shadow-cyan-900/20 transition transform active:scale-[0.98] mt-4 uppercase tracking-widest disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Procesando...' : (viewMode === 'register' ? 'Registrar Identidad' : 'Ingresar')}
          </button>
        </form>

        <div className="mt-8 text-center pt-4 border-t border-slate-700/50">
          <button
            onClick={() => {
              setViewMode(viewMode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="text-slate-400 text-sm font-bold hover:text-white transition"
          >
            {viewMode === 'login' ? '¿No tienes cuenta? Regístrate hoy' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

      </div>
    </div>
  )
}