import React, { useState, useEffect } from 'react';
import { X, Bell, UserPlus, Car, CreditCard, ShieldAlert } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function NotificationToast({ notifications, onDismiss }) {
    if (!notifications || notifications.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {notifications.map((notif) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className="pointer-events-auto bg-slate-900 border border-cyan-500/50 shadow-2xl shadow-cyan-900/20 rounded-xl p-4 w-80 flex items-start gap-3 backdrop-blur-md"
                    >
                        <div className={`p-2 rounded-lg ${notif.type === 'user' ? 'bg-purple-500/20 text-purple-400' :
                                notif.type === 'ride' ? 'bg-green-500/20 text-green-400' :
                                    notif.type === 'booking' ? 'bg-yellow-500/20 text-yellow-400' :
                                        notif.type === 'verification' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-slate-700 text-slate-300'
                            }`}>
                            {notif.type === 'user' && <UserPlus size={20} />}
                            {notif.type === 'ride' && <Car size={20} />}
                            {notif.type === 'booking' && <CreditCard size={20} />}
                            {notif.type === 'verification' && <ShieldAlert size={20} />}
                            {!['user', 'ride', 'booking', 'verification'].includes(notif.type) && <Bell size={20} />}
                        </div>

                        <div className="flex-1">
                            <h4 className="text-white font-bold text-sm mb-0.5">{notif.title}</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-slate-600 font-mono mt-1 block">
                                {new Date(notif.timestamp).toLocaleTimeString()}
                            </span>
                        </div>

                        <button
                            onClick={() => onDismiss(notif.id)}
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
