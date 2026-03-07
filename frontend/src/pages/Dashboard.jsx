import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Wallet, PieChart, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import PriceDisplay from '../components/trading/PriceDisplay';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { user } = useAuth();
    const { analytics, walletBalance, loading, fetchAnalytics } = usePortfolioStore();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold text-sm tracking-widest uppercase animate-pulse">Syncing Portfolio...</p>
                </div>
            </div>
        );
    }

    const currentValue = Number(analytics?.currentValue || 0);
    const invested = Number(analytics?.investedValue || 0);
    const pnl = Number(analytics?.pnl || 0);
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
    const isProfit = pnl >= 0;

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="relative min-h-screen bg-slate-50 pb-12 font-sans text-slate-900 overflow-hidden selection:bg-orange-100 selection:text-orange-600">

            {/* AMBIENT BACKGROUND BLOBS */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-300/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-rose-300/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Header Area */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
                        <p className="text-slate-500 mt-1 font-bold text-sm flex items-center gap-2">
                            Welcome back, <span className="text-orange-600">{user?.username}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/ai-advisor">
                            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95">
                                <Zap size={18} className="text-orange-500" />
                                AI Insights
                            </button>
                        </Link>
                        <Link to="/trade">
                            <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 transition-all active:scale-95 border-0">
                                <Wallet size={18} />
                                Invest Money
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Hero Stats Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Portfolio Card */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl shadow-slate-900/20 border border-slate-700/50">
                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                                        <TrendingUp size={16} className="text-orange-400" />
                                    </div>
                                    <p className="text-slate-300 font-bold text-xs uppercase tracking-widest">Total Portfolio Value</p>
                                </div>
                                <h2 className="text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-500">
                                    <PriceDisplay value={currentValue} showCurrency={true} className="!text-transparent" />
                                </h2>
                            </div>

                            <div className="flex items-center gap-6 mt-8">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Total Returns</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-bold text-white">
                                            {isProfit ? '+' : ''}₹{Math.abs(pnl).toLocaleString()}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center ${isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                            {isProfit ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                            {Math.abs(pnlPercent).toFixed(2)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="hidden sm:block">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Invested Capital</p>
                                    <p className="text-3xl font-bold text-white opacity-90">₹{invested.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Background Shapes */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-orange-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                    </motion.div>

                    {/* Quick Stats / Summary Card */}
                    <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-2xl rounded-[32px] border border-white p-8 shadow-xl shadow-slate-200/50 flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-orange-100 rounded-2xl text-orange-600 shadow-inner">
                                <PieChart size={28} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-lg">Portfolio Status</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Real-time breakdown</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-sm text-slate-500 font-bold">Active Positions</span>
                                <span className="text-xl font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">{analytics?.breakdown?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-5 bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl border border-orange-100/50 shadow-sm">
                                <span className="text-sm text-orange-800 font-bold">Available Cash</span>
                                <span className="text-xl font-black text-orange-600">
                                    <PriceDisplay value={walletBalance} showCurrency={true} />
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Holdings Section */}
                <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-2xl rounded-[32px] border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                                <TrendingUp size={20} />
                            </div>
                            Your Assets
                        </h3>
                        <Link to="/trade" className="text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-colors">
                            Manage Portfolio
                        </Link>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-widest">Asset Symbol</th>
                                    <th className="py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Quantity</th>
                                    <th className="py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Avg. Cost</th>
                                    <th className="py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Market Value</th>
                                    <th className="py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-widest text-right">P&L Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {analytics?.breakdown?.length > 0 ? (
                                    analytics.breakdown.map((item, index) => {
                                        const itemPnl = Number(item.current_value) - (Number(item.avg_price) * Number(item.quantity));
                                        const isItemProfit = itemPnl >= 0;

                                        return (
                                            <motion.tr
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-white/80 transition-colors group"
                                            >
                                                <td className="py-6 px-8">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold shadow-sm">
                                                            {item.symbol.charAt(0)}
                                                        </div>
                                                        <div className="font-black text-slate-900 group-hover:text-orange-600 transition-colors text-lg">{item.symbol}</div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-8 text-right font-bold text-slate-600 text-lg">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-6 px-8 text-right font-bold text-slate-600 text-lg">
                                                    ₹{Number(item.avg_price).toLocaleString()}
                                                </td>
                                                <td className="py-6 px-8 text-right">
                                                    <div className="font-black text-slate-900 text-lg">₹{Number(item.current_value).toLocaleString()}</div>
                                                </td>
                                                <td className="py-6 px-8 text-right">
                                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-black shadow-sm ${isItemProfit ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                        {isItemProfit ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                                                        ₹{Math.abs(itemPnl).toLocaleString()}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-32 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-80">
                                                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-orange-400 shadow-inner">
                                                    <Wallet size={40} />
                                                </div>
                                                <p className="text-slate-900 font-black mb-3 text-2xl tracking-tight">Your portfolio is empty</p>
                                                <p className="text-slate-500 font-medium mb-6 max-w-sm">Start building your wealth today by making your first investment.</p>
                                                <Link to="/trade">
                                                    <button className="bg-slate-900 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-orange-500/20 active:scale-95">
                                                        Explore Markets
                                                    </button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}