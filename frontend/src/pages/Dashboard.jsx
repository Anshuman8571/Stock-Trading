import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, IndianRupee, Briefcase, Activity, Clock, Plus, ArrowRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import Skeleton from '../components/Skeleton';
import { format } from 'date-fns';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes, ordersRes] = await Promise.all([
                    api.get('/portfolio/analytics'),
                    api.get('/orders/history')
                ]);
                setAnalytics(analyticsRes.data.analytics);
                // Get only last 3 orders
                setRecentOrders(ordersRes.data.orders.slice(-3).reverse()); 
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const StatCard = ({ title, value, subValue, isPositive, icon: Icon, colorClass }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
                    <Icon className={colorClass} size={24} />
                </div>
                {subValue && (
                    <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        {subValue}
                    </span>
                )}
            </div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-8 pb-10 max-w-7xl mx-auto">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-80 col-span-1" />
                    <Skeleton className="h-80 col-span-2" />
                </div>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-8 pb-10 max-w-7xl mx-auto">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-emerald-950">Overview</h1>
                        <p className="text-emerald-600/80">Market is Open • {format(new Date(), 'EEEE, d MMMM')}</p>
                    </div>
                    <Link to="/trade" className="hidden sm:flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition transform hover:-translate-y-0.5">
                        <Plus size={18} /> New Trade
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Total Invested" 
                        value={`₹${analytics.investedValue.toLocaleString('en-IN')}`} 
                        icon={IndianRupee} 
                        colorClass="text-blue-600 bg-blue-50"
                    />
                    <StatCard 
                        title="Current Value" 
                        value={`₹${analytics.currentValue.toLocaleString('en-IN')}`} 
                        icon={Activity} 
                        colorClass="text-purple-600 bg-purple-50"
                    />
                    <StatCard 
                        title="Total P&L" 
                        value={`${analytics.pnl >= 0 ? '+' : ''}₹${Math.abs(analytics.pnl).toFixed(2)}`}
                        subValue={`${((analytics.pnl / analytics.investedValue) * 100 || 0).toFixed(2)}%`} 
                        isPositive={analytics.pnl >= 0}
                        icon={Briefcase} 
                        colorClass={analytics.pnl >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Allocation Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50 lg:col-span-1 flex flex-col">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Allocation</h2>
                        <div className="flex-1 min-h-[250px]">
                            {analytics.breakdown.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analytics.breakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="current_value"
                                        >
                                            {analytics.breakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="bg-gray-50 p-4 rounded-full mb-3"><Briefcase size={24} /></div>
                                    <p>No assets yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Holdings & Recent Activity Split */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Holdings Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-emerald-50 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Top Holdings</h2>
                                <Link to="/portfolio" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Symbol</th>
                                            <th className="px-6 py-4 text-right">Qty</th>
                                            <th className="px-6 py-4 text-right">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {analytics.breakdown.slice(0, 5).map((item) => (
                                            <tr key={item.symbol} className="hover:bg-emerald-50/30 transition-colors">
                                                <td className="px-6 py-4 font-bold text-gray-900">{item.symbol}</td>
                                                <td className="px-6 py-4 text-gray-600 font-medium text-right">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-700">₹{item.current_value.toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}
                                        {analytics.breakdown.length === 0 && (
                                            <tr><td colSpan="3" className="p-8 text-center text-gray-400">No holdings found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Activity Widget */}
                        <div className="bg-white rounded-2xl shadow-sm border border-emerald-50 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                                <Link to="/orders" className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"><ArrowRight size={16} className="text-gray-600"/></Link>
                            </div>
                            <div className="space-y-4">
                                {recentOrders.length > 0 ? recentOrders.map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${order.side === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {order.side === 'BUY' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{order.symbol}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock size={10} /> {format(new Date(order.created_at), 'MMM d, h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{order.quantity} Qty</p>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${order.status === 'EXECUTED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center text-gray-400 py-4 text-sm">No recent activity</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </PageTransition>
    );
}