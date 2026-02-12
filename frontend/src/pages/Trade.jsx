import { useState, useEffect } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { RefreshCw, ArrowRight, TrendingUp, TrendingDown, Clock, DollarSign, Activity, Zap, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import PriceDisplay from '../components/trading/PriceDisplay.jsx';

export default function Trade() {
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState('MARKET'); // MARKET | LIMIT
    const [limitPrice, setLimitPrice] = useState('');
    const [side, setSide] = useState('BUY');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // SSE Listener for real-time updates
    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('token');
        const eventSource = new EventSource(`/api/orders/stream?token=${token}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'UPDATE') {
                if (data.status === 'EXECUTED') {
                    toast.success(`Order Executed: ${data.side} ${data.symbol} @ ₹${data.price}`, { 
                        icon: '🚀',
                        style: { borderRadius: '16px', fontWeight: 'bold' }
                    });
                } else if (data.status === 'FAILED') {
                    toast.error(`Order Failed: ${data.reason}`);
                }
            }
        };
        return () => eventSource.close();
    }, [user]);

    const handleTrade = async (e) => {
        e.preventDefault();
        if (!symbol) return toast.error("Enter a stock symbol");
        if (orderType === 'LIMIT' && !limitPrice) return toast.error("Enter a limit price");

        setLoading(true);
        const toastId = toast.loading("Processing Order...");

        try {
            const endpoint = side === 'BUY' ? '/orders/buy' : '/orders/sell';
            const payload = {
                symbol: symbol.toUpperCase(),
                quantity: parseInt(quantity),
                orderType,
                limitPrice: orderType === 'LIMIT' ? parseFloat(limitPrice) : null
            };

            await api.post(endpoint, payload);
            toast.success("Order Placed Successfully", { id: toastId });
            // Reset form
            setSymbol('');
            setQuantity(1);
            setLimitPrice('');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Trade failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full min-h-screen bg-slate-50/50 font-sans text-slate-900 overflow-hidden selection:bg-orange-100 selection:text-orange-600">
            
            {/* AMBIENT BACKGROUND BLOBS (Strictly Light Theme) */}
            <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-amber-100/50 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-20 space-y-8 animate-fade-in">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-orange-100 rounded-lg">
                                <Activity size={18} className="text-orange-600" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Execution Engine</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Trade Center</h1>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        <span>Protected by ProGuard Security</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT PANEL: Context & Stats */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Market Snapshot Card (Vibrant Orange Gradient) */}
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[32px] p-8 text-white shadow-xl shadow-orange-500/15 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <p className="text-orange-100 text-[10px] font-black uppercase tracking-widest">Global Index</p>
                                        <h2 className="text-3xl font-black tracking-tight">NIFTY 50</h2>
                                    </div>
                                    <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-black border border-white/20 backdrop-blur-md">
                                        LIVE
                                    </div>
                                </div>
                                
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black tracking-tighter font-mono">22,450.00</span>
                                    <div className="flex items-center bg-emerald-400/20 text-emerald-100 px-2 py-1 rounded-lg text-xs font-bold">
                                        <TrendingUp size={16} className="mr-1" strokeWidth={3} />
                                        +0.85%
                                    </div>
                                </div>
                                
                                <div className="mt-8 pt-8 border-t border-white/20 flex justify-between">
                                    <div className="space-y-1">
                                        <p className="text-orange-100 text-[10px] font-black uppercase tracking-widest">Day High</p>
                                        <p className="font-bold font-mono text-lg">22,510.20</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-orange-100 text-[10px] font-black uppercase tracking-widest">Day Low</p>
                                        <p className="font-bold font-mono text-lg text-orange-200">22,380.45</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Decorative Grid Effect */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        </div>

                        {/* Buying Power Card (Clean White) */}
                        <div className="bg-white backdrop-blur-xl rounded-[32px] p-8 border border-slate-100 shadow-sm group hover:border-orange-200 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                                    <DollarSign size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Buying Power</p>
                                    <h3 className="text-2xl font-black text-slate-900">₹10,00,000.00</h3>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-6">
                                <div className="h-full bg-blue-500 w-3/4 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Order Ticket */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            
                            {/* Tabs Header */}
                            <div className="flex p-3 bg-slate-50/80 gap-2 border-b border-slate-100">
                                <button 
                                    onClick={() => setSide('BUY')}
                                    className={clsx(
                                        "flex-1 py-4 rounded-[20px] font-black text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300",
                                        side === 'BUY' 
                                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                                            : "text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100"
                                    )}
                                >
                                    <TrendingUp size={16} strokeWidth={3} /> BUY ASSET
                                </button>
                                <button 
                                    onClick={() => setSide('SELL')}
                                    className={clsx(
                                        "flex-1 py-4 rounded-[20px] font-black text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300",
                                        side === 'SELL' 
                                            ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" 
                                            : "text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100"
                                    )}
                                >
                                    <TrendingDown size={16} strokeWidth={3} /> SELL ASSET
                                </button>
                            </div>

                            <form onSubmit={handleTrade} className="p-8 md:p-10 space-y-8">
                                
                                {/* Order Type Radio Group */}
                                <div className="flex bg-slate-100 rounded-2xl p-1.5">
                                    {['MARKET', 'LIMIT'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setOrderType(type)}
                                            className={clsx(
                                                "flex-1 py-3 text-[10px] font-black tracking-widest rounded-xl transition-all duration-300",
                                                orderType === type 
                                                    ? "bg-white text-slate-900 shadow-sm" 
                                                    : "text-slate-400 hover:text-slate-500"
                                            )}
                                        >
                                            {type} ORDER
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    {/* Symbol Input */}
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Symbol</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={symbol}
                                                onChange={e => setSymbol(e.target.value.toUpperCase())}
                                                placeholder="SEARCH TICKER (e.g. RELIANCE)"
                                                className="w-full text-3xl font-black tracking-tighter border-b-4 border-slate-200 bg-transparent pb-4 focus:border-orange-500 outline-none uppercase placeholder-slate-300 text-slate-900 transition-colors"
                                                required
                                            />
                                            <div className="absolute right-0 bottom-4">
                                                <Zap className="text-orange-500 animate-pulse" size={24} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quantity & Price Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={e => setQuantity(e.target.value)}
                                                min="1"
                                                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-2xl font-black font-mono text-slate-900 focus:border-orange-500 focus:bg-white outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        {orderType === 'LIMIT' && (
                                            <div className="space-y-2 animate-slide-up">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Limit Price</label>
                                                <input
                                                    type="number"
                                                    value={limitPrice}
                                                    onChange={e => setLimitPrice(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-2xl font-black font-mono text-slate-900 focus:border-orange-500 focus:bg-white outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Summary Block */}
                                <div className="bg-orange-50 rounded-3xl p-6 flex justify-between items-center border border-orange-100">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest">Estimated Value</p>
                                        <p className="text-2xl font-black text-orange-600 font-mono">
                                            {orderType === 'MARKET' ? 'MARKET PRICE' : `₹${(quantity * limitPrice).toLocaleString()}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest">Taxes & Charges</p>
                                        <p className="font-bold text-orange-600">₹0.00</p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button 
                                    disabled={loading}
                                    className={clsx(
                                        "w-full py-5 rounded-[28px] font-black text-xl text-white shadow-xl transform transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 flex items-center justify-center gap-3",
                                        side === 'BUY' ? "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-500" : "bg-rose-600 shadow-rose-600/20 hover:bg-rose-500"
                                    )}
                                >
                                    {loading ? <RefreshCw className="animate-spin" size={24} /> : (
                                        <>
                                            {side} {symbol || 'ASSET'} <ArrowRight strokeWidth={4} size={24} />
                                        </>
                                    )}
                                </button>
                                
                                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    <Clock size={14} strokeWidth={3} />
                                    <span>GTC: Good Till Cancelled</span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}