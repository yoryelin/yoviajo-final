import React from 'react';

const UserDetailModal = ({ user, onClose, onAction }) => {
    if (!user) return null;

    const handleAction = (action) => {
        onAction(user.id, action);
        if (action === "approve" || action === "block") {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-800/50">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {user.name}
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-900 text-purple-200' :
                                        user.role === 'C' ? 'bg-cyan-900 text-cyan-200' : 'bg-blue-900 text-blue-200'
                                    }`}>
                                    {user.role === 'C' ? 'Conductor' : user.role === 'P' ? 'Pasajero' : 'Admin'}
                                </span>
                            </h2>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                            <p className="text-slate-500 text-xs font-mono mt-1">ID: #{user.id} | DNI: {user.dni}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        ✕
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto space-y-6">

                    {/* Status Banner */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${user.is_active ? 'bg-green-900/20 border-green-500/30' : 'bg-yellow-900/20 border-yellow-500/30'
                        }`}>
                        <div>
                            <p className={`font-bold ${user.is_active ? 'text-green-400' : 'text-yellow-400'}`}>
                                {user.is_active ? '✅ CUENTA ACTIVA' : '⚠️ PENDIENTE DE APROBACIÓN'}
                            </p>
                            <p className="text-xs text-slate-400">
                                {user.is_active ? 'El usuario puede operar normalmente.' : 'El usuario NO puede iniciar sesión ni operar.'}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {!user.is_active && (
                                <button
                                    onClick={() => handleAction("approve")}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg hover:shadow-green-500/20 transition text-sm flex items-center gap-2"
                                >
                                    ✅ APROBAR
                                </button>
                            )}
                            {user.is_active && (
                                <button
                                    onClick={() => handleAction("block")}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition text-sm"
                                >
                                    🚫 BLOQUEAR
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-800 pb-1">Datos Personales</h3>
                            <div className="space-y-2 text-sm">
                                <p className="text-slate-300 flex justify-between">
                                    <span className="text-slate-500">Teléfono:</span>
                                    <span className="font-mono">{user.phone || '-'}</span>
                                </p>
                                <p className="text-slate-300 flex justify-between">
                                    <span className="text-slate-500">Fecha Nacimiento:</span>
                                    <span>{user.birth_date || '-'}</span>
                                </p>
                                <p className="text-slate-300 flex justify-between">
                                    <span className="text-slate-500">Dirección:</span>
                                    <span>{user.address || '-'}</span>
                                </p>
                                <p className="text-slate-300 flex justify-between">
                                    <span className="text-slate-500">Género:</span>
                                    <span>{user.gender === 'M' ? 'Masculino' : user.gender === 'F' ? 'Femenino' : '-'}</span>
                                </p>
                            </div>
                        </div>

                        {/* Driver Info (If applicable) */}
                        {user.role === 'C' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-cyan-500 uppercase border-b border-slate-800 pb-1">Vehículo y Licencia</h3>
                                <div className="space-y-2 text-sm bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                                    <p className="text-slate-300 flex justify-between">
                                        <span className="text-slate-500">Auto:</span>
                                        <span className="font-bold text-white">{user.car_model}</span>
                                    </p>
                                    <p className="text-slate-300 flex justify-between">
                                        <span className="text-slate-500">Patente:</span>
                                        <span className="font-mono text-yellow-500 font-bold">{user.car_plate}</span>
                                    </p>
                                    <p className="text-slate-300 flex justify-between">
                                        <span className="text-slate-500">Color:</span>
                                        <span>{user.car_color}</span>
                                    </p>
                                    <div className="pt-2 flex gap-2">
                                        {user.prefs_smoking && <span className="text-xs bg-slate-700 px-2 py-1 rounded">🚬 Fuma</span>}
                                        {user.prefs_pets && <span className="text-xs bg-slate-700 px-2 py-1 rounded">🐾 Mascotas</span>}
                                        {user.prefs_luggage && <span className="text-xs bg-slate-700 px-2 py-1 rounded">🧳 Baúl</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Document Verification */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-800 pb-1">Documentación</h3>
                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                            <div>
                                <p className="text-sm font-bold text-white">Documento de Identidad / Licencia</p>
                                <p className="text-xs text-slate-400">
                                    Estado: <span className={`uppercase font-bold ${user.verification_status === 'verified' ? 'text-green-400' :
                                            user.verification_status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                                        }`}>{user.verification_status}</span>
                                </p>
                            </div>
                            {user.verification_document ? (
                                <a href={user.verification_document} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-cyan-900/30 text-cyan-400 text-xs rounded border border-cyan-500/30 hover:bg-cyan-900/50 transition">
                                    Abrir Archivo ↗
                                </a>
                            ) : (
                                <span className="text-xs text-slate-500 italic">No subido</span>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-800 p-3 rounded-lg text-center">
                            <span className="block text-2xl font-bold text-white">{user.reputation_score}%</span>
                            <span className="text-[10px] uppercase text-slate-500 font-bold">Reputación</span>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg text-center">
                            <span className="block text-2xl font-bold text-white">{user.cancellation_count}</span>
                            <span className="text-[10px] uppercase text-slate-500 font-bold">Cancelaciones</span>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg text-center">
                            <span className="block text-2xl font-bold text-white">0</span>
                            <span className="text-[10px] uppercase text-slate-500 font-bold">Viajes</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
