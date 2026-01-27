import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../context/AuthContext';

import { API_URL } from '@config/api.js';

const AdminRides = () => {
    const { token } = useAuth();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const LIMIT = 20;

    useEffect(() => {
        const fetchRides = async () => {
            setLoading(true);
            try {

                const response = await fetch(`${API_URL}/admin/rides?skip=${page * LIMIT}&limit=${LIMIT}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setRides(data);
                }
            } catch (error) {
                console.error("Error fetching rides:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRides();
    }, [token, page]);

    return (
        <AdminLayout>
            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Ride Management</h2>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-slate-400 self-center">Page {page + 1}</span>
                        <button
                            disabled={rides.length < LIMIT}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Driver</th>
                                <th className="px-6 py-3">Route</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Seats</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                            ) : rides.map((r) => (
                                <tr key={r.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                                    <td className="px-6 py-4 font-mono text-sm text-slate-500">{r.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{r.driver?.full_name || r.driver?.name}</div>
                                        <div className="text-xs text-slate-500">{r.driver?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-cyan-400">{r.origin}</div>
                                        <div className="text-pink-400">to {r.destination}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {new Date(r.departure_time).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${r.status === 'active' ? 'bg-green-900/50 text-green-200' :
                                            r.status === 'completed' ? 'bg-blue-900/50 text-blue-200' :
                                                'bg-red-900/50 text-red-200'
                                            }`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {r.available_seats} disp.
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminRides;
