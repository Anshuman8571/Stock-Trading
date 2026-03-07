import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Search, ShieldCheck, History, ArrowRight, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PriceDisplay from '../components/trading/PriceDisplay';

const OrderStatusBadge = ({ status }) => {
    const styles = {
        PENDING: 'bg-amber-100/70 text-amber-700 border-amber-200 shadow-amber-500/10',
        PROCESSING: 'bg-blue-100/70 text-blue-700 border-blue-200 shadow-blue-500/10',
        EXECUTED: 'bg-emerald-100/70 text-emerald-700 border-emerald-200 shadow-emerald-500/10',
        FAILED: 'bg-rose-100/70 text-rose-700 border-rose-200 shadow-rose-500/10',
        CANCELLED: 'bg-slate-100/70 text-slate-700 border-slate-200 shadow-slate-500/10'
    };

    return (
        <div className={clsx(
            "text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest border shadow-sm flex items-center gap-1.5",
            styles[status] || styles.PENDING
        )}>
            <div className={clsx(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                status === 'EXECUTED' ? 'bg-emerald-500' :
                    status === 'FAILED' ? 'bg-rose-500' :
                        status === 'PENDING' ? 'bg-amber-500' : 'bg-slate-500'
            )} />
            {status || 'UNKNOWN'}
        </div>
    );
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('/api/orders/history', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });

                let ordersArray = [];
                if (data && Array.isArray(data.orders)) ordersArray = data.orders;
                else if (data && Array.isArray(data.data)) ordersArray = data.data;
                else if (Array.isArray(data)) ordersArray = data;

                const sortedOrders = ordersArray.sort((a, b) => {
                    const dateA = new Date(a.created_at || a.createdAt || 0);
                    const dateB = new Date(b.created_at || b.createdAt || 0);
                    return dateB - dateA;
                });

                setOrders(sortedOrders);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                toast.error("Unable to load order history");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filtered = orders.filter(o => filter === 'ALL' || o.side === filter);

    const safeFormatDate = (dateStr, formatStr) => {
        try {
            if (!dateStr) return 'N/A';
            return format(new Date(dateStr), formatStr);
        } catch (e) {
            return '--';
        }
    };

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-orange-500/20"></div>
                    <p className="text-slate-500 font-bold text-sm tracking-widest uppercase animate-pulse">Loading History...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-50 pb-20 font-sans text-slate-900 overflow-hidden selection:bg-orange-100 selection:text-orange-600">

            {/* AMBIENT BACKGROUND BLOBS */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-300/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-rose-300/20 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-orange-100 rounded-lg">
                                <History size={18} className="text-orange-600" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Activity Log</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Order History</h1>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl font-bold text-sm hidden lg:flex mr-4 shadow-sm border border-emerald-100">
                            <ShieldCheck size={18} />
                            <span>ProGuard Secured</span>
                        </div>

                        {/* Filter Pills */}
                        <div className="flex p-1.5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 gap-1">
                            {['ALL', 'BUY', 'SELL'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={clsx(
                                        "px-6 py-2 rounded-xl text-xs font-black tracking-widest transition-all duration-300",
                                        filter === type
                                            ? (type === 'BUY' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20' :
                                                type === 'SELL' ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/20' :
                                                    'bg-slate-900 text-white shadow-md shadow-slate-900/20')
                                            : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Orders List / Empty State */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filtered.length > 0 ? (
                            filtered.map((order) => {
                                const rawDate = order.created_at || order.createdAt;
                                const totalCost = order.price ? order.price * order.quantity : 0;
                                const isBuy = order.side === 'BUY';

                                return (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        className="group relative bg-white/70 backdrop-blur-xl rounded-[24px] border border-white shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-6">

                                            {/* Left: Icon & Symbol */}
                                            <div className="flex items-center gap-5 min-w-[200px]">
                                                <div className={clsx(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-inner",
                                                    isBuy ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                )}>
                                                    {isBuy ? <ArrowDownRight size={24} strokeWidth={3} /> : <ArrowUpRight size={24} strokeWidth={3} />}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">
                                                        {order.symbol}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs font-bold font-mono">
                                                        <Clock size={12} />
                                                        {safeFormatDate(rawDate, 'dd MMM yy, HH:mm')}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Middle Desktop Grid (Price & Qty details) */}
                                            <div className="grid grid-cols-2 lg:grid-cols-4 w-full gap-4 text-sm bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Action</span>
                                                    <span className={clsx(
                                                        "font-black tracking-widest",
                                                        isBuy ? 'text-emerald-600' : 'text-rose-600'
                                                    )}>
                                                        {order.side}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Qty</span>
                                                    <span className="font-mono font-bold text-slate-700">{order.quantity} Shares</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Price</span>
                                                    <span className="font-mono font-bold text-slate-700">
                                                        {order.price ? `₹${Number(order.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-start lg:items-end">
                                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Limit</span>
                                                    <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm">
                                                        {totalCost > 0 ? `₹${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right: Status */}
                                            <div className="flex sm:flex-col items-center sm:items-end gap-2 min-w-[120px]">
                                                <OrderStatusBadge status={order.status} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <motion.div
                                variants={itemVariants}
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white shadow-sm p-12 text-center flex flex-col items-center justify-center my-10"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-orange-200 blur-3xl rounded-full opacity-50" />
                                    <div className="relative w-24 h-24 bg-gradient-to-br from-white to-slate-100 rounded-[32px] flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 border border-white">
                                        <Search size={40} strokeWidth={2.5} className="text-orange-500" />
                                    </div>
                                </div>
                                <h3 className="text-slate-900 font-extrabold text-2xl mb-2 tracking-tight">No orders found</h3>
                                <p className="text-slate-500 font-medium text-sm mb-8 max-w-sm">
                                    Looks like you haven't placed any {filter !== 'ALL' ? filter.toLowerCase() : ''} orders yet. Your history will appear here.
                                </p>
                                <Link to="/trade">
                                    <button className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black rounded-2xl hover:from-orange-600 hover:to-rose-600 shadow-xl shadow-orange-500/20 transition-all flex items-center gap-2 hover:scale-105 active:scale-95">
                                        Start Trading <ArrowRight size={18} strokeWidth={3} />
                                    </button>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}