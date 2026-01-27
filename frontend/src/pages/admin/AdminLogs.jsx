import React, { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../context/AuthContext';

import { API_URL } from '@config/api.js';

const AdminLogs = () => {
    const { token } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const LIMIT = 50;

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {

                const response = await fetch(`${API_URL}/admin/logs?skip=${page * LIMIT}&limit=${LIMIT}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setLogs(data);
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [token, page]);

    return (
        <AdminLayout>
            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">System Audit Logs</h2>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-slate-400 self-center">Page {page + 1} (Latest)</span>
                        <button
                            disabled={logs.length < LIMIT}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-slate-700 text-white rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-slate-300 font-mono text-sm">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-3">Time (UTC)</th>
                                <th className="px-6 py-3">Action</th>
                                <th className="px-6 py-3">User ID</th>
                                <th className="px-6 py-3">IP</th>
                                <th className="px-6 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-cyan-400">
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4 text-white">
                                        {log.user_id}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {log.ip_address}
                                    </td>
                                    <td className="px-6 py-4 max-w-md truncate" title={JSON.stringify(log.details, null, 2)}>
                                        <code className="text-xs bg-slate-950 px-2 py-1 rounded">
                                            {JSON.stringify(log.details)}
                                        </code>
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

export default AdminLogs;
