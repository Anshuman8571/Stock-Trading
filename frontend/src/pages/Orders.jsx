import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Search, ShieldCheck, History, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// Inlined Badge to prevent import resolution crashes
const OrderStatusBadge = ({ status }) => {
    const styles = {
        PENDING: 'bg-amber-100/70 text-amber-700 border-amber-200',
        PROCESSING: 'bg-blue-100/70 text-blue-700 border-blue-200',
        EXECUTED: 'bg-emerald-100/70 text-emerald-700 border-emerald-200',
        FAILED: 'bg-rose-100/70 text-rose-700 border-rose-200',
        CANCELLED: 'bg-slate-100/70 text-slate-700 border-slate-200'
    };
    
    return (
        <span className={clsx(
            "text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest border",
            styles[status] || styles.PENDING
        )}>
            {status || 'UNKNOWN'}
        </span>
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
                
                // Bulletproof data extraction: Handles { orders: [] }, { data: [] }, or just []
                let ordersArray = [];
                if (data && Array.isArray(data.orders)) ordersArray = data.orders;
                else if (data && Array.isArray(data.data)) ordersArray = data.data;
                else if (Array.isArray(data)) ordersArray = data;
                
                // Safely sort the array without crashing on missing dates
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

    // Safe date formatter to prevent complete page crashes on bad data
    const safeFormatDate = (dateStr, formatStr) => {
        try {
            if (!dateStr) return 'N/A';
            return format(new Date(dateStr), formatStr);
        } catch (e) {
            return '--';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Fetching Orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-screen bg-slate-50/50 font-sans text-slate-900 overflow-hidden selection:bg-orange-100 selection:text-orange-600">
            
            {/* AMBIENT BACKGROUND BLOBS */}
            <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-amber-100/50 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 pb-20 space-y-8 animate-fade-in">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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
                        <div className="flex items-center gap-3 text-slate-500 font-bold text-sm hidden lg:flex mr-4">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            <span>ProGuard Security</span>
                        </div>
                        
                        {/* Filter Pills */}
                        <div className="flex p-1.5 bg-white/80 backdrop-blur-xl rounded-[24px] shadow-sm border border-slate-100 gap-1">
                            {['ALL', 'BUY', 'SELL'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={clsx(
                                        "px-6 py-2.5 rounded-[20px] text-[10px] font-black tracking-widest transition-all duration-300",
                                        filter === type 
                                            ? (type === 'BUY' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 
                                               type === 'SELL' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 
                                               'bg-slate-900 text-white shadow-lg shadow-slate-900/20')
                                            : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Orders Table Container */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Symbol</th>
                                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                                    <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((order) => {
                                    const rawDate = order.created_at || order.createdAt;
                                    return (
                                        <tr key={order.id} className="hover:bg-orange-50/30 transition-colors group">
                                            <td className="py-6 px-8 text-sm text-slate-500 font-bold">
                                                {safeFormatDate(rawDate, 'dd MMM yy')}
                                                <span className="ml-2 text-slate-400 text-xs font-semibold">
                                                    {safeFormatDate(rawDate, 'HH:mm')}
                                                </span>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="font-black text-lg text-slate-900 group-hover:text-orange-600 transition-colors">{order.symbol}</div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <span className={clsx(
                                                    "text-[10px] font-black px-3 py-1 rounded-full tracking-widest",
                                                    order.side === 'BUY' ? 'bg-emerald-100/50 text-emerald-700' : 'bg-rose-100/50 text-rose-700'
                                                )}>
                                                    {order.side}
                                                </span>
                                            </td>
                                            <td className="py-6 px-8 text-right font-black text-slate-700 font-mono">
                                                {order.quantity}
                                            </td>
                                            <td className="py-6 px-8 text-right font-black text-slate-700 font-mono">
                                                {order.price ? `₹${Number(order.price).toLocaleString(undefined, {minimumFractionDigits: 2})}` : '-'}
                                            </td>
                                            <td className="py-6 px-8 text-right font-black text-slate-900 font-mono">
                                                {order.price ? `₹${(order.price * order.quantity).toLocaleString(undefined, {minimumFractionDigits: 2})}` : '-'}
                                            </td>
                                            <td className="py-6 px-8 flex justify-center">
                                                <OrderStatusBadge status={order.status} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {/* Empty State */}
                        {filtered.length === 0 && (
                            <div className="py-24 text-center flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mb-6 text-slate-300">
                                    <Search size={40} strokeWidth={2.5} />
                                </div>
                                <p className="text-slate-500 font-black text-xl mb-4">No orders found</p>
                                <p className="text-slate-400 text-sm font-medium mb-6">Looks like you haven't placed any {filter !== 'ALL' ? filter.toLowerCase() : ''} orders yet.</p>
                                <Link to="/trade">
                                    <button className="px-8 py-3 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 shadow-xl shadow-orange-600/20 transition-all flex items-center gap-2">
                                        Start Trading <ArrowRight size={18} strokeWidth={3} />
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}