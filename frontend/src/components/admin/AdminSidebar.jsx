import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Users', path: '/admin/users', icon: '👥' },
        { name: 'Rides', path: '/admin/rides', icon: '🚗' },
        { name: 'Bookings', path: '/admin/bookings', icon: '🎟️' },
        { name: 'Transactions', path: '/admin/transactions', icon: '💰' },
    ];

    return (
        <aside className="w-full md:w-64 bg-slate-900 rounded-lg border border-slate-700 p-4 h-fit">
            <h2 className="text-xl font-bold text-white mb-6 px-2">Menu</h2>
            <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default AdminSidebar;
