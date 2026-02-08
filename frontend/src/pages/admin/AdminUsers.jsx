import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserDetailModal from '../../components/admin/UserDetailModal';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import { API_URL } from '@config/api.js';

const AdminUsers = () => {
    const token = localStorage.getItem('token');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [confirmState, setConfirmState] = useState({ isOpen: false, userId: null, action: null });
    const LIMIT = 20;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/admin/users?skip=${page * LIMIT}&limit=${LIMIT}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token, page]);

    // Opens the modal instead of immediate action
    const handleAction = (userId, action) => {
        setConfirmState({
            isOpen: true,
            userId,
            action
        });
    };

    // Executed ONLY when specific logic (Block/Approve/SwitchRole) is confirmed
    const executeAction = async () => {
        const { userId, action } = confirmState;
        const verb = action === "approve" ? "ACTIVATE" : action === "block" ? "BLOCK" : "UPDATE";

        try {
            let response;
            if (action === 'switch_role') {
                const user = users.find(u => u.id === userId) || selectedUser;
                const newRole = user.role === 'C' ? 'P' : 'C';
                response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ role: newRole })
                });
            } else {
                response = await fetch(`${API_URL}/admin/users/${userId}/${action}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            if (response.ok) {
                // WhatsApp Integration (Mirroring original logic)
                if (action === "approve") {
                    const user = users.find(u => u.id === userId) || selectedUser;
                    if (user && user.phone) {
                        const message = `Hola ${user.name}! 👋\n\nTu cuenta en *YoViajo!* ha sido aprobada por un administrador.\n\nYa puedes ingresar y comenzar a viajar: https://yoviajo-frontend.onrender.com`;
                        const url = `https://wa.me/${user.phone}?text=${encodeURIComponent(message)}`;
                        try {
                            window.open(url, '_blank');
                        } catch (e) {
                            console.error("Popup blocked?", e);
                        }
                    }
                }

                alert(`User ${verb}D successfully.`);
                fetchUsers(); // Refresh list

                // If user detail modal is open, we need to close it or refresh it. 
                // Since fetchUsers updates the list, if we passed the user object it might be stale.
                // Simplest is to close it or handle update.
                if (selectedUser) {
                    // setSelectedUser(null); // Optional: close modal on success
                    // Or better, let the list update reflect, but selectedUser local state needs update? 
                    // fetchUsers updates 'users' array. 'selectedUser' is a separate state object.
                    // We should probably re-fetch selected user or close modal.
                    setSelectedUser(null);
                }
            } else {
                const err = await response.json();
                alert(`Action failed: ${err.detail}`);
            }
        } catch (error) {
            console.error(`Error ${action}:`, error);
        }
    };

    const handleVerifyDecision = async (userId, decision) => {
        if (!confirm(`Are you sure you want to ${decision.toUpperCase()} this user verification?`)) return;

        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: decision }) // approved | rejected
            });

            if (response.ok) {
                alert(`Verification ${decision} successfully.`);
                fetchUsers();
            } else {
                alert('Action failed.');
            }
        } catch (error) {
            console.error("Error verify:", error);
        }
    };

    return (
        <>
            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">User Management</h2>
                    <p className="text-xs text-slate-500 mr-auto ml-4">(Click para ver detalle)</p>
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
                            disabled={users.length < LIMIT}
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
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Verification</th>
                                <th className="px-6 py-3">Document</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                            ) : users.map((u) => (
                                <tr
                                    key={u.id}
                                    className="border-b border-slate-800 hover:bg-slate-800/50 transition cursor-pointer"
                                    onClick={() => setSelectedUser(u)}
                                >
                                    <td className="px-6 py-4 font-mono text-sm text-slate-500">#{u.id}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-white">{u.full_name || u.name}</p>
                                            <p className="text-xs text-slate-500">{u.email}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${u.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}`}>
                                                    {u.role}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        {u.is_active ? (
                                            <span className="bg-green-900/50 text-green-400 px-2 py-1 rounded-full text-xs font-bold uppercase border border-green-500/30">Active</span>
                                        ) : (
                                            <span className="bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded-full text-xs font-bold uppercase border border-yellow-500/30">Inactive</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        {u.verification_status === 'verified' && <span className="text-green-400 font-bold text-xs uppercase bg-green-900/30 px-2 py-1 rounded">Verified</span>}
                                        {u.verification_status === 'pending' && <span className="text-yellow-400 font-bold text-xs uppercase bg-yellow-900/30 px-2 py-1 rounded">Pending Review</span>}
                                        {u.verification_status === 'rejected' && <span className="text-red-400 font-bold text-xs uppercase bg-red-900/30 px-2 py-1 rounded">Rejected</span>}
                                        {u.verification_status === 'unverified' && <span className="text-slate-500 text-xs italic">Unverified</span>}
                                    </td>

                                    <td className="px-6 py-4">
                                        {u.verification_document ? (
                                            <a
                                                href={u.verification_document}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-lg transition group"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span className="text-xl">📄</span>
                                                <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300">Ver Archivo</span>
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 opacity-40">
                                                <span className="text-slate-500 text-xs font-mono">No Adjunto</span>
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        {!u.is_active && (
                                            <button
                                                onClick={() => handleAction(u.id, "approve")}
                                                className="p-2 bg-green-600 hover:bg-green-500 rounded text-white shadow text-xs font-bold" title="Activate Account"
                                            >
                                                ACTIVATE
                                            </button>
                                        )}
                                        {u.is_active && (
                                            <button
                                                onClick={() => handleAction(u.id, "block")}
                                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white shadow text-xs" title="Block Account"
                                            >
                                                🚫
                                            </button>
                                        )}

                                        {u.verification_status === 'pending' && (
                                            <>
                                                <div className="w-px h-6 bg-white/10 mx-1"></div>
                                                <button
                                                    onClick={() => handleVerifyDecision(u.id, "approved")}
                                                    className="p-2 bg-green-600 hover:bg-green-500 rounded text-white shadow" title="Approve Verify"
                                                >
                                                    ✅
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyDecision(u.id, "rejected")}
                                                    className="p-2 bg-red-600 hover:bg-red-500 rounded text-white shadow" title="Reject Verify"
                                                >
                                                    ❌
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onAction={handleAction}
                />
            )}

            <ConfirmationModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
                onConfirm={executeAction}
                title={confirmState.action === 'block' ? 'Bloquear Usuario' : confirmState.action === 'switch_role' ? 'Cambiar Rol' : 'Aprobar Usuario'}
                message={confirmState.action === 'block'
                    ? '¿Estás seguro de que deseas bloquear a este usuario? No podrá acceder a su cuenta.'
                    : confirmState.action === 'switch_role'
                        ? '¿Estás seguro de cambiar el rol de este usuario? (Pasajero <-> Conductor)'
                        : '¿Estás seguro de que deseas aprobar a este usuario? Podrá acceder a la plataforma.'}
                isDangerous={confirmState.action === 'block'}
                confirmText={confirmState.action === 'block' ? 'Bloquear' : confirmState.action === 'switch_role' ? 'Cambiar Rol' : 'Aprobar'}
            />
        </>
    );
};

export default AdminUsers;
