import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // API URL logic
    const RAW_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8003'
    let API_BASE = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;
    if (!API_BASE.endsWith('/api')) {
        if (API_BASE.endsWith('/')) API_BASE = API_BASE.slice(0, -1);
        API_BASE = `${API_BASE}/api`;
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.")
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.")
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`${API_BASE}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || "Error al restablecer contraseña")
            }

            setMessage("¡Contraseña actualizada! Ya puedes iniciar sesión.")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500 text-red-200 p-6 rounded-xl text-center">
                    <h3 className="text-xl font-bold mb-2">Enlace inválido ❌</h3>
                    <p>No se encontró el token de seguridad. Vuelve a solicitar el email.</p>
                    <Link to="/forgot-password" className="text-white underline mt-4 block">Intentar de nuevo</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 text-center">

                <h2 className="text-2xl font-black text-white mb-2">Nueva Contraseña</h2>
                <p className="text-slate-400 text-sm mb-6">Elige una clave segura para tu cuenta.</p>

                {!message ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1 text-left">
                            <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Nueva Contraseña</label>
                            <input
                                className="input-field w-full"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1 text-left">
                            <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Confirmar Contraseña</label>
                            <input
                                className="input-field w-full"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg text-red-300 text-xs font-bold">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/20 active:scale-[0.98] transition"
                        >
                            {loading ? 'Actualizando...' : 'Guardar Nueva Contraseña'}
                        </button>
                    </form>
                ) : (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 animate-fade-in">
                        <p className="text-green-200 font-bold text-lg mb-4">✅ {message}</p>
                        <Link
                            to="/"
                            className="bg-white text-slate-900 font-bold py-3 px-6 rounded-xl hover:bg-slate-200 transition inline-block"
                        >
                            Iniciar Sesión
                        </Link>
                    </div>
                )}

            </div>
        </div>
    )
}
