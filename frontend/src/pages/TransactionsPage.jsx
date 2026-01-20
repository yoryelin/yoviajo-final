import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export default function TransactionsPage() {
    const { authFetch } = useAuth()
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTransactions()
    }, [])

    const fetchTransactions = async () => {
        try {
            const res = await authFetch('/api/bookings/admin/transactions')
            if (res.ok) {
                const data = await res.json()
                setTransactions(data)
            }
        } catch (error) {
            console.error("Error fetching transactions:", error)
        } finally {
            setLoading(false)
        }
    }

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.fee_amount || 0), 0)

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 pb-20 pt-20">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                            Panel de Transacciones
                        </h1>
                        <p className="text-slate-400 mt-2">Monitoreo de ingresos y pagos confirmados.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Recaudado</p>
                        <p className="text-4xl font-black text-emerald-400">${totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950 text-slate-200 uppercase font-bold text-xs tracking-wider">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Pasajero (Payer)</th>
                                    <th className="p-4">Viaje / Conductor</th>
                                    <th className="p-4 text-right">Monto (Fee)</th>
                                    <th className="p-4 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-500 italic">Cargando transacciones...</td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-500 italic">No hay transacciones registradas aún.</td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <motion.tr
                                            key={tx.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-800/50 transition cursor-default"
                                        >
                                            <td className="p-4 font-mono text-xs text-slate-500">#{tx.id}</td>
                                            <td className="p-4 text-white font-medium">
                                                {new Date(tx.updated_at || tx.created_at).toLocaleDateString()} <br />
                                                <span className="text-[10px] text-slate-500">{new Date(tx.updated_at || tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                                                        {tx.passenger_name?.[0] || '?'}
                                                    </div>
                                                    <span className="text-slate-200">{tx.passenger_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-xs">{tx.ride_origin} ➝ {tx.ride_destination}</span>
                                                    <span className="text-[10px] text-slate-500">Cond: {tx.driver_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-black text-emerald-400">
                                                ${tx.fee_amount?.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/20">
                                                    ACREDITADO
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
