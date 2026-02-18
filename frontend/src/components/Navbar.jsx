import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Activity, 
    History, 
    BrainCircuit, 
    LogOut, 
    TrendingUp,
    UserCircle,
    Wallet // ✅ Added Wallet icon import
} from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Trade', path: '/trade', icon: Activity },
        { name: 'Wallet', path: '/wallet', icon: Wallet }, // ✅ Added Wallet Link
        { name: 'Orders', path: '/orders', icon: History },
        { name: 'AI Advisor', path: '/ai-advisor', icon: BrainCircuit },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    
                    {/* LEFT: Brand Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer transform transition-transform hover:scale-105 active:scale-95" onClick={() => navigate('/')}>
                        <div className="p-2 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/20 mr-3">
                            <TrendingUp size={24} className="text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-slate-900">
                            ProTrader
                        </span>
                    </div>

                    {/* CENTER: Navigation Links (Desktop) */}
                    <div className="hidden md:flex flex-1 justify-center px-8">
                        <div className="flex space-x-2 bg-slate-50/50 p-1.5 rounded-[20px] border border-slate-100">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                const Icon = link.icon;
                                
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={clsx(
                                            "flex items-center gap-2 px-5 py-2.5 rounded-[16px] text-sm font-bold transition-all duration-200",
                                            isActive 
                                                ? "bg-white text-orange-600 shadow-sm border border-slate-100/50" 
                                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                                        )}
                                    >
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT: User Profile & Logout */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-[16px] border border-slate-100">
                            <UserCircle size={20} className="text-slate-400" />
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-900 leading-none">{user?.username || 'Trader'}</span>
                                <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase mt-0.5">Verified</span>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleLogout}
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors duration-200"
                            title="Logout"
                        >
                            <LogOut size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* MOBILE: Navigation Links (Scrollable Row) */}
                <div className="md:hidden flex overflow-x-auto py-3 space-x-2 scrollbar-hide border-t border-slate-100">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        const Icon = link.icon;
                        
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-bold whitespace-nowrap transition-all duration-200",
                                    isActive 
                                        ? "bg-orange-50 text-orange-600 border border-orange-100/50" 
                                        : "text-slate-500 bg-slate-50 border border-transparent"
                                )}
                            >
                                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}