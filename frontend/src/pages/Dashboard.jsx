import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
    TrendingUp, TrendingDown, Activity, ArrowRight, 
    Briefcase, PieChart, Zap, Clock, ShoppingBag, BarChart3,
    AlertCircle, RefreshCw, Eye
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Dashboard() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [analyticsRes, ordersRes] = await Promise.allSettled([
                api.get('/portfolio/analytics'),
                api.get('/orders/history')
            ]);

            if (analyticsRes.status === 'fulfilled') {
                setAnalytics(analyticsRes.value.data.analytics);
            }

            if (ordersRes.status === 'fulfilled') {
                const sortedOrders = ordersRes.value.data.orders
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5);
                setRecentOrders(sortedOrders);
            }
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-text-secondary font-medium animate-pulse">Loading market data...</p>
                </div>
            </div>
        );
    }

    // Calculations
    const currentValue = Number(analytics?.currentValue || 0);
    const investedValue = Number(analytics?.investedValue || 0);
    const totalPnL = Number(analytics?.pnl || 0);
    const pnlPercent = investedValue > 0 ? (totalPnL / investedValue) * 100 : 0;
    const isProfit = totalPnL >= 0;
    const holdingsCount = analytics?.breakdown?.length || 0;

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold text-text-primary tracking-tight">
                            Portfolio Dashboard
                        </h1>
                        <button
                            onClick={() => fetchDashboardData(true)}
                            disabled={refreshing}
                            className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw size={20} className={`text-text-tertiary ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <p className="text-text-secondary">
                        Welcome back, <span className="font-semibold text-text-primary">{user?.username || 'Trader'}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/trade">
                        <Button variant="success" size="lg" className="shadow-lg font-semibold">
                            <TrendingUp size={20} />
                            New Trade
                        </Button>
                    </Link>
                    <Link to="/ai-advisor">
                        <Button variant="secondary" size="lg">
                            <Zap size={20} />
                            AI Insights
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Portfolio Stats Grid - Premium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                
                {/* Current Value - Highlighted Card */}
                <div className="card-glass relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-text-tertiary text-sm font-medium uppercase tracking-wider">Portfolio Value</span>
                            <div className="status-dot live"></div>
                        </div>
                        <div className="price-large font-mono text-text-primary mb-2">
                            ₹{currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                                isProfit ? 'text-profit' : 'text-loss'
                            }`}>
                                {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                            </span>
                            <span className="text-text-tertiary text-xs">all time</span>
                        </div>
                    </div>
                </div>

                {/* Total Invested */}
                <div className="bg-bg-primary border border-border-primary rounded-xl p-6 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-text-tertiary text-sm font-medium uppercase tracking-wider">Invested</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Briefcase className="text-blue-500" size={20} />
                        </div>
                    </div>
                    <div className="price-medium font-mono text-text-primary mb-1">
                        ₹{investedValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-text-tertiary text-xs">Capital deployed</p>
                </div>

                {/* Total P&L */}
                <div className={`bg-bg-primary border rounded-xl p-6 hover:shadow-md transition-all ${
                    isProfit ? 'border-profit/30 bg-profit/5' : 'border-loss/30 bg-loss/5'
                }`}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-text-tertiary text-sm font-medium uppercase tracking-wider">P&L</span>
                        <div className={`p-2 rounded-lg ${isProfit ? 'bg-profit/10' : 'bg-loss/10'}`}>
                            {isProfit ? (
                                <TrendingUp className="text-profit" size={20} />
                            ) : (
                                <TrendingDown className="text-loss" size={20} />
                            )}
                        </div>
                    </div>
                    <div className={`price-medium font-mono mb-1 ${isProfit ? 'text-profit' : 'text-loss'}`}>
                        {isProfit ? '+' : ''}₹{Math.abs(totalPnL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className={`text-xs font-semibold ${isProfit ? 'text-profit-dark' : 'text-loss-dark'}`}>
                        {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}% return
                    </p>
                </div>

                {/* Active Holdings */}
                <div className="bg-bg-primary border border-border-primary rounded-xl p-6 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-text-tertiary text-sm font-medium uppercase tracking-wider">Holdings</span>
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <PieChart className="text-purple-500" size={20} />
                        </div>
                    </div>
                    <div className="price-medium font-mono text-text-primary mb-1">
                        {holdingsCount}
                    </div>
                    <p className="text-text-tertiary text-xs">Active positions</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Holdings Table */}
                <div className="lg:col-span-2">
                    <div className="bg-bg-primary border border-border-primary rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-border-primary flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">Your Assets</h2>
                                <p className="text-sm text-text-tertiary mt-1">Real-time portfolio breakdown</p>
                            </div>
                            <Link to="/trade">
                                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
                                    <Eye size={16} />
                                    Market
                                </Button>
                            </Link>
                        </div>
                        
                        {analytics?.breakdown?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-bg-secondary text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Symbol</th>
                                            <th className="px-6 py-4 text-right">Quantity</th>
                                            <th className="px-6 py-4 text-right">Avg Price</th>
                                            <th className="px-6 py-4 text-right">Current Value</th>
                                            <th className="px-6 py-4 text-right">P&L</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-primary">
                                        {analytics.breakdown.map((item, index) => {
                                            const itemPnL = Number(item.current_value) - (Number(item.avg_price) * Number(item.quantity));
                                            const itemPnLPercent = ((itemPnL / (Number(item.avg_price) * Number(item.quantity))) * 100).toFixed(2);
                                            const isProfitable = itemPnL >= 0;
                                            
                                            return (
                                                <tr 
                                                    key={index} 
                                                    className="hover:bg-bg-hover transition-colors group"
                                                >
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-text-primary font-mono">
                                                            {item.symbol}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono text-text-secondary">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono text-text-tertiary">
                                                        ₹{Number(item.avg_price).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono font-semibold text-text-primary">
                                                        ₹{Number(item.current_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className={`font-mono text-sm font-semibold ${isProfitable ? 'text-profit' : 'text-loss'}`}>
                                                            {isProfitable ? '+' : ''}₹{Math.abs(itemPnL).toFixed(2)}
                                                        </div>
                                                        <div className={`text-xs ${isProfitable ? 'text-profit-dark' : 'text-loss-dark'}`}>
                                                            {isProfitable ? '+' : ''}{itemPnLPercent}%
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-16 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-tertiary rounded-full mb-4">
                                    <ShoppingBag size={32} className="text-text-tertiary" />
                                </div>
                                <h3 className="text-lg font-semibold text-text-primary mb-2">No assets yet</h3>
                                <p className="text-text-tertiary mb-6">Start building your portfolio today</p>
                                <Link to="/trade">
                                    <Button variant="primary">
                                        <TrendingUp size={18} />
                                        Start Trading
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders - Side Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-bg-primary border border-border-primary rounded-xl overflow-hidden h-full">
                        <div className="p-6 border-b border-border-primary flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-text-primary">Recent Orders</h2>
                                <p className="text-xs text-text-tertiary mt-1">Latest transactions</p>
                            </div>
                            <Link to="/orders">
                                <button className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                    View All
                                    <ArrowRight size={14} />
                                </button>
                            </Link>
                        </div>
                        
                        <div className="divide-y divide-border-primary max-h-[600px] overflow-y-auto">
                            {recentOrders.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Clock className="mx-auto mb-3 text-text-tertiary opacity-50" size={32} />
                                    <p className="text-sm text-text-tertiary">No recent activity</p>
                                </div>
                            ) : (
                                recentOrders.map((order) => (
                                    <div 
                                        key={order.id} 
                                        className="p-4 hover:bg-bg-hover transition-colors group"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    order.side === 'BUY' 
                                                        ? 'bg-profit/10 text-profit' 
                                                        : 'bg-loss/10 text-loss'
                                                }`}>
                                                    {order.side === 'BUY' ? (
                                                        <TrendingUp size={16} />
                                                    ) : (
                                                        <TrendingDown size={16} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-text-primary font-mono">
                                                        {order.symbol}
                                                    </p>
                                                    <p className="text-xs text-text-tertiary">
                                                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge.OrderStatus status={order.status} size="sm" />
                                        </div>
                                        <div className="flex items-center justify-between text-xs ml-11">
                                            <span className="text-text-tertiary">
                                                {order.quantity} qty @ ₹{order.price?.toFixed(2) || '—'}
                                            </span>
                                            <span className="font-mono font-semibold text-text-secondary">
                                                ₹{(Number(order.quantity) * Number(order.price || 0)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/trade" className="group">
                    <div className="bg-bg-primary border border-border-primary rounded-xl p-6 hover:shadow-lg hover:border-profit/50 transition-all">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-profit/10 rounded-xl group-hover:bg-profit/20 transition-colors">
                                <ShoppingBag size={24} className="text-profit" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-text-primary mb-1">Place Order</h3>
                                <p className="text-sm text-text-tertiary">Buy or sell stocks instantly</p>
                            </div>
                            <ArrowRight className="text-text-tertiary group-hover:text-profit group-hover:translate-x-1 transition-all" size={20} />
                        </div>
                    </div>
                </Link>

                <Link to="/orders" className="group">
                    <div className="bg-bg-primary border border-border-primary rounded-xl p-6 hover:shadow-lg hover:border-primary-500/50 transition-all">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary-500/10 rounded-xl group-hover:bg-primary-500/20 transition-colors">
                                <Clock size={24} className="text-primary-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-text-primary mb-1">Order History</h3>
                                <p className="text-sm text-text-tertiary">View all transactions</p>
                            </div>
                            <ArrowRight className="text-text-tertiary group-hover:text-primary-600 group-hover:translate-x-1 transition-all" size={20} />
                        </div>
                    </div>
                </Link>

                <Link to="/ai-advisor" className="group">
                    <div className="bg-bg-primary border border-border-primary rounded-xl p-6 hover:shadow-lg hover:border-purple-500/50 transition-all">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                                <Zap size={24} className="text-purple-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-text-primary mb-1">AI Analysis</h3>
                                <p className="text-sm text-text-tertiary">Get smart insights</p>
                            </div>
                            <ArrowRight className="text-text-tertiary group-hover:text-purple-500 group-hover:translate-x-1 transition-all" size={20} />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}