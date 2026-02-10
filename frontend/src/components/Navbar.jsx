import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Wallet, History, LogOut, Bell, TrendingUp, Sun, Moon, Sparkles } from 'lucide-react';
import api from '../api/axios';
import clsx from 'clsx';

export default function Navbar() {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
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
            <Link 
                to={to} 
                className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium",
                    isActive 
                        ? "bg-emerald-500 dark:bg-emerald-600 text-white shadow-md shadow-emerald-900/20 dark:shadow-emerald-500/20" 
                        : "text-emerald-100 dark:text-emerald-200 hover:text-white hover:bg-emerald-800 dark:hover:bg-emerald-700"
                )}
            >
                <Icon size={18} /> <span>{label}</span>
            </Link>
        );
    };

    return (
        <nav className="bg-emerald-900 dark:bg-dark-bg-secondary text-white shadow-lg sticky top-0 z-50 border-b border-emerald-800 dark:border-dark-border-primary transition-colors duration-200">
            <div className="container mx-auto px-4 max-w-7xl h-16 flex justify-between items-center">
                
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-90 transition">
                    <div className="bg-emerald-500 dark:bg-emerald-600 p-1.5 rounded-lg shadow-lg">
                        <TrendingUp size={24} />
                    </div>
                    <span className="hidden sm:block">ProTrader</span>
                </Link>

                {/* Links */}
                <div className="hidden md:flex gap-2">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/trade" icon={Wallet} label="Trade" />
                    <NavItem to="/orders" icon={History} label="History" />
                    <NavItem to="/ai-advisor" icon={Sparkles} label="AI Advisor" />
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-emerald-200 dark:text-emerald-300 hover:text-white transition rounded-full hover:bg-emerald-800 dark:hover:bg-dark-bg-tertiary"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Notification Bell */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowDropdown(!showDropdown)} 
                            className="relative p-2 text-emerald-200 dark:text-emerald-300 hover:text-white transition rounded-full hover:bg-emerald-800 dark:hover:bg-dark-bg-tertiary"
                            aria-label="Notifications"
                        >
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 h-5 w-5 bg-rose-500 rounded-full border-2 border-emerald-900 dark:border-dark-bg-secondary text-xs flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl border border-gray-100 dark:border-dark-border-primary overflow-hidden text-gray-800 dark:text-dark-text-primary z-50 animate-slide-down">
                                <div className="p-3 bg-gray-50 dark:bg-dark-bg-tertiary border-b border-gray-100 dark:border-dark-border-primary font-bold text-sm text-gray-600 dark:text-dark-text-secondary flex justify-between items-center">
                                    <span>Notifications</span>
                                    <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">{unreadCount} unread</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400 dark:text-dark-text-muted text-sm">No new notifications</div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => markAsRead(notif.id)}
                                                className={clsx(
                                                    "p-3 border-b border-gray-50 dark:border-dark-border-primary text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors",
                                                    !notif.is_read && "bg-emerald-50/50 dark:bg-emerald-900/10 border-l-4 border-l-emerald-500"
                                                )}
                                            >
                                                <p className="font-bold text-gray-800 dark:text-dark-text-primary">{notif.title}</p>
                                                <p className="text-gray-500 dark:text-dark-text-muted truncate mt-0.5">{notif.message}</p>
                                                <p className="text-xs text-gray-400 dark:text-dark-text-muted mt-1">
                                                    {new Date(notif.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile & Logout */}
                    <div className="hidden md:block text-right mr-2">
                         <p className="text-xs text-emerald-300 dark:text-emerald-400">Signed in as</p>
                         <p className="text-sm font-semibold text-white">{user?.username || user?.email?.split('@')[0]}</p>
                    </div>

                    <button 
                        onClick={logout} 
                        className="p-2 text-emerald-300 dark:text-emerald-400 hover:text-rose-300 dark:hover:text-rose-400 hover:bg-emerald-950 dark:hover:bg-dark-bg-tertiary rounded-full transition-all" 
                        title="Logout"
                        aria-label="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-emerald-900 dark:bg-dark-bg-secondary border-t border-emerald-800 dark:border-dark-border-primary px-4 py-2 z-50">
                <div className="flex justify-around items-center">
                    <Link to="/" className={clsx("flex flex-col items-center gap-1 p-2", location.pathname === "/" ? "text-white" : "text-emerald-300")}>
                        <LayoutDashboard size={20} />
                        <span className="text-xs">Home</span>
                    </Link>
                    <Link to="/trade" className={clsx("flex flex-col items-center gap-1 p-2", location.pathname === "/trade" ? "text-white" : "text-emerald-300")}>
                        <Wallet size={20} />
                        <span className="text-xs">Trade</span>
                    </Link>
                    <Link to="/ai-advisor" className={clsx("flex flex-col items-center gap-1 p-2", location.pathname === "/ai-advisor" ? "text-white" : "text-emerald-300")}>
                        <Sparkles size={20} />
                        <span className="text-xs">AI</span>
                    </Link>
                    <Link to="/orders" className={clsx("flex flex-col items-center gap-1 p-2", location.pathname === "/orders" ? "text-white" : "text-emerald-300")}>
                        <History size={20} />
                        <span className="text-xs">Orders</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}