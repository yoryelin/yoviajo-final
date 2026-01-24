import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../context/AuthContext';

const AdminBookings = () => {
    const { token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const LIMIT = 20;

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const response = await fetch(`${API_URL}/api/admin/bookings?skip=${page * LIMIT}&limit=${LIMIT}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setBookings(data);
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [token, page]);

    return (
        <AdminLayout>
            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Booking Management</h2>
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
                            disabled={bookings.length < LIMIT}
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
                                <th className="px-6 py-3">Passenger</th>
                                <th className="px-6 py-3">Ride</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Payment</th>
                                <th className="px-6 py-3">Seats</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                            ) : bookings.map((b) => (
                                <tr key={b.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                                    <td className="px-6 py-4 font-mono text-sm text-slate-500">{b.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{b.user?.full_name || b.user?.name}</div>
                                        <div className="text-xs text-slate-500">{b.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>Ride #{b.ride_id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            b.status === 'confirmed' ? 'bg-green-900/50 text-green-200' : 
                                            b.status === 'cancelled' ? 'bg-red-900/50 text-red-200' :
                                            'bg-yellow-900/50 text-yellow-200'
                                        }`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            b.payment_status === 'paid' || b.payment_status === 'approved' ? 'bg-green-900/50 text-green-200' : 
                                            'bg-slate-700 text-slate-400'
                                        }`}>
                                            {b.payment_status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{b.seats_booked}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminBookings;
