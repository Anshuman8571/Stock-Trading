import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, History, LogOut, Bell, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import clsx from 'clsx';

export default function Navbar() {
    const { logout, user } = useAuth();
    const location = useLocation();
    
    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Fetch Notifications
    useEffect(() => {
        if (user) {
            const fetchNotifs = async () => {
                try {
                    const { data } = await api.get('/user/notifications');
                    setNotifications(data.notifications);
                } catch (e) { console.error(e); }
            };
            fetchNotifs();
            
            // Poll for notifications every 10 seconds
            const interval = setInterval(fetchNotifs, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/user/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (e) { console.error(e); }
    };

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link to={to} className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium",
                isActive ? "bg-emerald-500 text-white shadow-md shadow-emerald-900/20" : "text-emerald-100 hover:text-white hover:bg-emerald-800")}>
                <Icon size={18} /> <span>{label}</span>
            </Link>
        );
    };

    return (
        <nav className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50 border-b border-emerald-800">
            <div className="container mx-auto px-4 max-w-7xl h-16 flex justify-between items-center">
                
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-90 transition">
                    <div className="bg-emerald-500 p-1.5 rounded-lg"><TrendingUp size={24} /></div>
                    <span>ProTrader</span>
                </Link>

                {/* Links */}
                <div className="hidden md:flex gap-2">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/trade" icon={Wallet} label="Trade" />
                    <NavItem to="/orders" icon={History} label="History" />
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    
                    {/* Notification Bell */}
                    <div className="relative">
                        <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 text-emerald-200 hover:text-white transition rounded-full hover:bg-emerald-800">
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-emerald-900"></span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden text-gray-800 z-50">
                                <div className="p-3 bg-gray-50 border-b font-bold text-sm text-gray-600 flex justify-between items-center">
                                    <span>Notifications</span>
                                    <span className="text-xs font-normal text-emerald-600">{unreadCount} unread</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div key={notif.id} 
                                                 onClick={() => markAsRead(notif.id)}
                                                 className={clsx("p-3 border-b text-sm cursor-pointer hover:bg-gray-50 transition-colors", !notif.is_read && "bg-emerald-50/50 border-l-4 border-l-emerald-500")}>
                                                <p className="font-bold text-gray-800">{notif.title}</p>
                                                <p className="text-gray-500 truncate mt-0.5">{notif.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile & Logout */}
                    <div className="hidden md:block text-right mr-2">
                         <p className="text-xs text-emerald-300">Signed in as</p>
                         <p className="text-sm font-semibold text-white">{user?.username || user?.email?.split('@')[0]}</p>
                    </div>

                    <button onClick={logout} className="p-2 text-emerald-300 hover:text-rose-300 hover:bg-emerald-950 rounded-full transition-all" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
}