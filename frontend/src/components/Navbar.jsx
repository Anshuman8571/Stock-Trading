import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
    LayoutDashboard, Wallet, History, LogOut, Bell, TrendingUp, 
    Sun, Moon, Sparkles, Menu, X 
} from 'lucide-react';
import api from '../api/axios';
import clsx from 'clsx';

export default function Navbar() {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Fetch Notifications
    useEffect(() => {
        if (user) {
            const fetchNotifs = async () => {
                try {
                    const { data } = await api.get('/user/notifications');
                    setNotifications(data.notifications);
                } catch (e) { 
                    console.error('Failed to fetch notifications:', e); 
                }
            };
            fetchNotifs();
            
            const interval = setInterval(fetchNotifs, 30000); // Poll every 30 seconds
            return () => clearInterval(interval);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/user/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => 
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (e) { 
            console.error('Failed to mark notification as read:', e); 
        }
    };

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link 
                to={to} 
                onClick={() => setShowMobileMenu(false)}
                className={clsx(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-semibold text-sm",
                    isActive 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white shadow-lg shadow-emerald-500/30" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
            >
                <Icon size={20} /> 
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <>
            <nav className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
                <div className="container mx-auto px-4 max-w-7xl h-16 flex justify-between items-center">
                    
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 text-xl font-extrabold hover:opacity-90 transition">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 p-2 rounded-xl shadow-lg">
                            <TrendingUp size={24} strokeWidth={3} className="text-white" />
                        </div>
                        <span className="hidden sm:block bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                            ProTrader
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex gap-2">
                        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                        <NavItem to="/trade" icon={Wallet} label="Trade" />
                        <NavItem to="/orders" icon={History} label="Orders" />
                        <NavItem to="/ai-advisor" icon={Sparkles} label="AI Advisor" />
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all rounded-xl"
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowDropdown(!showDropdown)} 
                                className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all rounded-xl"
                                aria-label="Notifications"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 h-5 w-5 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900 text-xs flex items-center justify-center font-bold text-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-slide-down">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                        <span className="font-bold text-gray-900 dark:text-white">Notifications</span>
                                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                            {unreadCount} unread
                                        </span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div 
                                                    key={notif.id} 
                                                    onClick={() => markAsRead(notif.id)}
                                                    className={clsx(
                                                        "p-4 border-b border-gray-100 dark:border-gray-800 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors",
                                                        !notif.is_read && "bg-emerald-50/50 dark:bg-emerald-900/10 border-l-4 border-l-emerald-500"
                                                    )}
                                                >
                                                    <p className="font-bold text-gray-900 dark:text-white mb-1">
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                                        {new Date(notif.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile - Desktop */}
                        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                            <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    {user?.username || user?.email?.split('@')[0]}
                                </p>
                            </div>
                            <button 
                                onClick={logout} 
                                className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all" 
                                title="Logout"
                                aria-label="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all rounded-xl"
                            aria-label="Toggle menu"
                        >
                            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-slide-down">
                        <div className="container mx-auto px-4 py-4 space-y-2">
                            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                            <NavItem to="/trade" icon={Wallet} label="Trade" />
                            <NavItem to="/orders" icon={History} label="Orders" />
                            <NavItem to="/ai-advisor" icon={Sparkles} label="AI Advisor" />
                            
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {user?.username || user?.email?.split('@')[0]}
                                    </p>
                                </div>
                                <button 
                                    onClick={logout}
                                    className="flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-semibold hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-all"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Bottom Navigation - Always visible on mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 z-50 safe-area-inset-bottom">
                <div className="flex justify-around items-center max-w-md mx-auto">
                    <Link 
                        to="/" 
                        className={clsx(
                            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                            location.pathname === "/" 
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30" 
                                : "text-gray-600 dark:text-gray-400"
                        )}
                    >
                        <LayoutDashboard size={22} />
                        <span className="text-xs font-semibold">Home</span>
                    </Link>
                    <Link 
                        to="/trade" 
                        className={clsx(
                            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                            location.pathname === "/trade" 
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30" 
                                : "text-gray-600 dark:text-gray-400"
                        )}
                    >
                        <Wallet size={22} />
                        <span className="text-xs font-semibold">Trade</span>
                    </Link>
                    <Link 
                        to="/ai-advisor" 
                        className={clsx(
                            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                            location.pathname === "/ai-advisor" 
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30" 
                                : "text-gray-600 dark:text-gray-400"
                        )}
                    >
                        <Sparkles size={22} />
                        <span className="text-xs font-semibold">AI</span>
                    </Link>
                    <Link 
                        to="/orders" 
                        className={clsx(
                            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                            location.pathname === "/orders" 
                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30" 
                                : "text-gray-600 dark:text-gray-400"
                        )}
                    >
                        <History size={22} />
                        <span className="text-xs font-semibold">Orders</span>
                    </Link>
                </div>
            </div>
        </>
    );
}