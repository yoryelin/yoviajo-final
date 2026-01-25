import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    // API URL logic (Reuse from Login)
    const RAW_URL = import.meta.env.VITE_API_URL || 'https://api.yoviajo.com.ar'
    let API_BASE = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;
    if (!API_BASE.endsWith('/api')) {
        // Just to be safe if env var has trialing slash
        if (API_BASE.endsWith('/')) API_BASE = API_BASE.slice(0, -1);
        API_BASE = `${API_BASE}/api`;
    }
    // Simplified logic: usually just RAW + /api. 
    // Let's stick to a robust fetcher or just inline for this simple page.

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const response = await fetch(`${API_BASE}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            // Always show success message for security/UX
            setMessage('Si el correo existe, recibirás las instrucciones en breve.')
        } catch (err) {
            setMessage('Hubo un error al conectar con el servidor.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 text-center">

                <h2 className="text-2xl font-black text-white mb-2">Recuperar Cuenta</h2>
                <p className="text-slate-400 text-sm mb-6">Ingresa tu email y te enviaremos un enlace.</p>

                {!message ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            className="input-field w-full"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 active:scale-[0.98] transition"
                        >
                            {loading ? 'Enviando...' : 'Enviar Enlace'}
                        </button>
                    </form>
                ) : (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 animate-fade-in">
                        <p className="text-green-200 font-bold text-sm">✅ {message}</p>
                        <p className="text-green-200/60 text-xs mt-1">Revisa tu bandeja de entrada o spam.</p>
                    </div>
                )}

                <div className="mt-8">
                    <Link to="/" className="text-slate-500 hover:text-white text-sm font-bold transition">
                        ← Volver al Inicio
                    </Link>
                </div>

            </div>
        </div>
    )
}
