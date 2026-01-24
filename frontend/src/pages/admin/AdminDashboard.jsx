import React, { useEffect, useState } from 'react';
import Layout from '../../layouts/Layout'; // CORREGIDO: Ruta correcta
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        const fetchStats = async () => {
            try {
                // Use the full URL or configure proxy, assuming standard api prefix from Vite config or explicit
                // Using relative path if proxy is set up, or strictly constructing it
                // Based on previous issues, using explicit URL might be safer but let's try relative first or the env var
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

                const response = await fetch(`${API_URL}/api/admin/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch admin stats');
                }

                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error("Admin stats error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, token, navigate]);

    if (loading) return <Layout><div className="p-4 text-white">Loading Admin Console...</div></Layout>;
    if (error) return <Layout><div className="p-4 text-red-500">Error: {error}</div></Layout>;

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-white mb-8">Admin Console</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat Card 1 */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Users</h3>
                        <p className="text-4xl font-bold text-emerald-400 mt-2">{stats?.total_users || 0}</p>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Rides</h3>
                        <p className="text-4xl font-bold text-blue-400 mt-2">{stats?.total_rides || 0}</p>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Rides</h3>
                        <p className="text-4xl font-bold text-purple-400 mt-2">{stats?.active_rides || 0}</p>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Bookings</h3>
                        <p className="text-4xl font-bold text-yellow-400 mt-2">{stats?.total_bookings || 0}</p>
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/admin/transactions')} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition">
                            View Transactions
                        </button>
                        {/* Placeholder for future actions */}
                        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition">
                            View Transactions
                        </button>
                    </div>
                </div>

                {/* User Management Section */}
                <div className="mt-12 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-white">User Management (Recent)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Verified</th>
                                    <th className="px-6 py-3">Reputation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats && stats.users_preview ? (
                                    stats.users_preview.map((u) => (
                                        <tr key={u.id} className="border-b border-gray-700 hover:bg-gray-700">
                                            <td className="px-6 py-4">{u.id}</td>
                                            <td className="px-6 py-4">{u.full_name || u.name}</td>
                                            <td className="px-6 py-4">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.is_verified ?
                                                    <span className="text-green-400">Yes</span> :
                                                    <span className="text-yellow-500">No</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4">{u.reputation_score || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                            Loading users... (Requires backend update)
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
