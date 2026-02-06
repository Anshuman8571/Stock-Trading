import { useEffect, useState } from 'react';
import api from '../api/axios';
import PageTransition from '../components/PageTransition';
import Skeleton from '../components/Skeleton';
import { format } from 'date-fns';
import { Search, FileQuestion } from 'lucide-react';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders/history');
                // Sort by date descending (newest first)
                setOrders(data.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(o => o.symbol.includes(searchTerm.toUpperCase()));

    const getStatusStyles = (status) => {
        switch (status) {
            case 'EXECUTED': return 'text-emerald-700 bg-emerald-100 border border-emerald-200';
            case 'FAILED': return 'text-rose-700 bg-rose-100 border border-rose-200';
            case 'PENDING': return 'text-amber-700 bg-amber-100 border border-amber-200';
            case 'CANCELLED': return 'text-slate-600 bg-slate-100 border border-slate-200';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) return (
        <div className="max-w-6xl mx-auto space-y-4">
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        </div>
    );

    return (
        <PageTransition>
            <div className="max-w-6xl mx-auto pb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-emerald-950">Transactions</h1>
                        <p className="text-emerald-600/80">Track your order history and status</p>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-3 text-emerald-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Symbol..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-emerald-900 placeholder-emerald-300/70"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-emerald-50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-gray-500">Time</th>
                                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-gray-500">Symbol</th>
                                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-gray-500">Side</th>
                                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-gray-500">Qty</th>
                                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-gray-500">Price</th>
                                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-emerald-50/30 transition-colors group">
                                        <td className="p-5 text-sm font-medium text-gray-500 group-hover:text-emerald-700">
                                            {format(new Date(order.created_at), 'MMM d, h:mm a')}
                                        </td>
                                        <td className="p-5 font-bold text-gray-900">{order.symbol}</td>
                                        <td className={`p-5 font-bold ${order.side === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {order.side}
                                        </td>
                                        <td className="p-5 font-medium text-gray-700">{order.quantity}</td>
                                        <td className="p-5 font-medium text-gray-700">
                                            {order.price ? `₹${Number(order.price).toFixed(2)}` : '-'}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyles(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Empty State */}
                    {filteredOrders.length === 0 && (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <div className="bg-gray-50 p-6 rounded-full mb-4">
                                <FileQuestion size={48} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">
                                {searchTerm ? `No results for "${searchTerm}"` : "You haven't placed any orders yet. Go to the trade page to get started."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}