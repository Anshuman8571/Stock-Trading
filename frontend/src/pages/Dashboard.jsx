import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { TrendingUp, TrendingDown, DollarSign, Activity, Clock, ArrowRight, Briefcase } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Dashboard() {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Portfolio Summary and Recent Orders in parallel
                const [portfolioRes, ordersRes] = await Promise.allSettled([
                    api.get('/portfolio/summary'),
                    api.get('/orders/my-orders?limit=5') // Assuming this endpoint exists
                ]);

                // Handle Portfolio Data
                if (portfolioRes.status === 'fulfilled') {
                    setPortfolio(portfolioRes.value.data);
                } else {
                    // Fallback/Mock data if API fails or doesn't exist yet
                    setPortfolio({
                        totalValue: 0,
                        totalInvested: 0,
                        totalProfitLoss: 0,
                        dayChange: 0,
                        holdingsCount: 0
                    });
                }

                // Handle Orders Data
                if (ordersRes.status === 'fulfilled') {
                    setRecentOrders(ordersRes.value.data.orders || []);
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    const isProfit = portfolio?.totalProfitLoss >= 0;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.name?.split(' ')[0] || 'Trader'}! 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Here's what's happening with your portfolio today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/trade">
                        <Button variant="primary" className="flex items-center gap-2">
                            <TrendingUp size={18} />
                            New Trade
                        </Button>
                    </Link>
                    <Link to="/ai-advisor">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Activity size={18} />
                            Ask AI
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 2. Portfolio Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Value */}
                <Card className="p-0 overflow-hidden border-l-4 border-l-emerald-500">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Portfolio Value</p>
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <DollarSign size={20} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₹{portfolio?.totalValue?.toLocaleString() || '0.00'}
                        </h3>
                        <div className="mt-1 flex items-center text-sm">
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                                <TrendingUp size={14} className="mr-1" />
                                +{portfolio?.dayChange || '0'}%
                            </span>
                            <span className="text-gray-400 mx-2">•</span>
                            <span className="text-gray-500">Today</span>
                        </div>
                    </div>
                </Card>

                {/* Total Invested */}
                <Card className="p-0 overflow-hidden border-l-4 border-l-blue-500">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invested</p>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Briefcase size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₹{portfolio?.totalInvested?.toLocaleString() || '0.00'}
                        </h3>
                    </div>
                </Card>

                {/* Total Profit/Loss */}
                <Card className={`p-0 overflow-hidden border-l-4 ${isProfit ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total P&L</p>
                            <div className={`p-2 rounded-lg ${isProfit ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                                {isProfit ? (
                                    <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <TrendingDown size={20} className="text-rose-600 dark:text-rose-400" />
                                )}
                            </div>
                        </div>
                        <h3 className={`text-2xl font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isProfit ? '+' : ''}₹{portfolio?.totalProfitLoss?.toLocaleString() || '0.00'}
                        </h3>
                    </div>
                </Card>

                {/* Active Holdings Count */}
                <Card className="p-0 overflow-hidden border-l-4 border-l-violet-500">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Holdings</p>
                            <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                                <Activity size={20} className="text-violet-600 dark:text-violet-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {portfolio?.holdingsCount || 0}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Stocks in portfolio</p>
                    </div>
                </Card>
            </div>

            {/* 3. Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart or Big Section (Placeholder for now) */}
                <div className="lg:col-span-2">
                     <Card className="h-full min-h-[300px] flex flex-col justify-center items-center text-center p-8 border-dashed border-2 border-gray-200 dark:border-gray-700">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
                            <Activity size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Analysis</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            Your portfolio performance chart will appear here once you have enough trading history.
                        </p>
                        <Link to="/ai-advisor">
                            <Button>Get AI Analysis</Button>
                        </Link>
                    </Card>
                </div>

                {/* Recent Orders List */}
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white">Recent Orders</h3>
                            <Link to="/orders" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
                                View All <ArrowRight size={14} className="ml-1" />
                            </Link>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Clock size={24} className="mx-auto mb-2 opacity-50" />
                                <p>No recent orders</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                order.type === 'BUY' 
                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                                            }`}>
                                                {order.type === 'BUY' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{order.symbol}</p>
                                                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900 dark:text-white">₹{order.price}</p>
                                            <Badge variant={order.status === 'COMPLETED' ? 'success' : 'warning'}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}