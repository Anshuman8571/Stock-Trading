import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Wallet, PieChart, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import PriceDisplay from '../components/trading/PriceDisplay';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { getWalletBalance } from '../services/walletService'; // ✅ Import Wallet Service

export default function Dashboard() {
    const { user } = useAuth();
    const { analytics, loading, fetchAnalytics } = usePortfolioStore();
    const [walletBalance, setWalletBalance] = useState(0); // ✅ State for Wallet Balance

    useEffect(() => {
        fetchAnalytics(); 
        fetchWalletData(); // ✅ Fetch Wallet Balance on mount
    }, []);

    // ✅ Fetch function
    const fetchWalletData = async () => {
        try {
            const balance = await getWalletBalance();
            setWalletBalance(Number(balance));
        } catch (error) {
            console.error("Failed to fetch wallet balance", error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium text-sm animate-pulse">Syncing Portfolio...</p>
                </div>
            </div>
        );
    }

    const currentValue = Number(analytics?.currentValue || 0);
    const invested = Number(analytics?.investedValue || 0);
    const pnl = Number(analytics?.pnl || 0);
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
    const isProfit = pnl >= 0;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 animate-fade-in">
                
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                        <p className="text-slate-500 mt-1 font-medium">Welcome back, {user?.username}</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/ai-advisor">
                            <Button variant="secondary" className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
                                <Zap size={18} className="text-orange-500" /> 
                                <span className="ml-2">AI Insights</span>
                            </Button>
                        </Link>
                        <Link to="/trade">
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 border-0">
                                <Wallet size={18} /> 
                                <span className="ml-2">Invest Money</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Hero Stats Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Main Portfolio Card */}
                    <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 p-8 text-white shadow-xl shadow-orange-500/15">
                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
                            <div>
                                <p className="text-orange-100 font-medium mb-1 text-sm uppercase tracking-wider">Total Portfolio Value</p>
                                <h2 className="text-5xl font-bold tracking-tight">
                                    <PriceDisplay value={currentValue} showCurrency={true} className="text-white" />
                                </h2>
                            </div>
                            
                            <div className="flex items-center gap-6 mt-6">
                                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3">
                                    <p className="text-[10px] text-orange-100 uppercase tracking-widest font-bold mb-1">Total Returns</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold">
                                            {isProfit ? '+' : ''}₹{Math.abs(pnl).toLocaleString()}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold flex items-center ${isProfit ? 'bg-emerald-400/20 text-emerald-100' : 'bg-white/20 text-white'}`}>
                                            {isProfit ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownRight size={14} className="mr-1"/>}
                                            {Math.abs(pnlPercent).toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="hidden sm:block">
                                    <p className="text-[10px] text-orange-100 uppercase tracking-widest font-bold mb-1">Invested Capital</p>
                                    <p className="text-2xl font-bold opacity-90">₹{invested.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Background Shapes */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
                    </div>

                    {/* Quick Stats / Summary Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                <PieChart size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Portfolio Status</h3>
                                <p className="text-xs text-slate-500">Real-time breakdown</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-sm text-slate-600 font-medium">Active Positions</span>
                                <span className="text-lg font-bold text-slate-900">{analytics?.breakdown?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-sm text-slate-600 font-medium">Available Cash</span>
                                {/* ✅ Updated to show real balance */}
                                <span className="text-lg font-bold text-slate-900">
                                    <PriceDisplay value={walletBalance} showCurrency={true} />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Holdings Section */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp size={20} className="text-orange-500" />
                            Your Assets
                        </h3>
                        <Link to="/trade" className="text-sm font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors">
                            Manage Portfolio
                        </Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Asset Symbol</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Quantity</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Avg. Cost</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Market Value</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">P&L Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {analytics?.breakdown?.length > 0 ? (
                                    analytics.breakdown.map((item, index) => {
                                        const itemPnl = Number(item.current_value) - (Number(item.avg_price) * Number(item.quantity));
                                        const isItemProfit = itemPnl >= 0;
                                        
                                        return (
                                            <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="py-5 px-6">
                                                    <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{item.symbol}</div>
                                                </td>
                                                <td className="py-5 px-6 text-right font-medium text-slate-600">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-5 px-6 text-right font-medium text-slate-600">
                                                    ₹{Number(item.avg_price).toLocaleString()}
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <div className="font-bold text-slate-900">₹{Number(item.current_value).toLocaleString()}</div>
                                                </td>
                                                <td className="py-5 px-6 text-right">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${isItemProfit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                        {isItemProfit ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                                                        ₹{Math.abs(itemPnl).toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-60">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                                    <Wallet size={32} />
                                                </div>
                                                <p className="text-slate-500 font-medium mb-2 text-lg">No assets in portfolio</p>
                                                <Link to="/trade">
                                                    <button className="text-orange-600 font-bold hover:underline">Place your first trade</button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}