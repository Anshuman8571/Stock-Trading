import { useState, useEffect } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { RefreshCw, ArrowRight, TrendingUp, TrendingDown, Clock, IndianRupee, Activity, Zap, ShieldCheck, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getWalletBalance } from '../services/walletService';
import PriceDisplay from '../components/trading/PriceDisplay.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Trade() {
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [orderType, setOrderType] = useState('MARKET'); // MARKET | LIMIT
    const [limitPrice, setLimitPrice] = useState('');
    const [side, setSide] = useState('BUY');
    const [loading, setLoading] = useState(false);

    // ✅ Wallet & Price States
    const [walletBalance, setWalletBalance] = useState(0);
    const [currentMarketPrice, setCurrentMarketPrice] = useState(0);
    const [fetchingPrice, setFetchingPrice] = useState(false);

    const { user } = useAuth();

    // Fetch wallet balance on component mount
    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                const balance = await getWalletBalance();
                setWalletBalance(Number(balance));
            } catch (error) {
                console.error("Failed to fetch wallet balance", error);
            }
        };
        fetchWalletData();
    }, []);

    // ✅ Fetch Live Market Price when Symbol changes (Debounced)
    useEffect(() => {
        if (symbol.length >= 2) {
            setFetchingPrice(true);
            const timer = setTimeout(async () => {
                try {
                    const res = await api.get(`/market/price/${symbol}`);
                    if (res.data && res.data.price) {
                        setCurrentMarketPrice(Number(res.data.price));
                    } else {
                        setCurrentMarketPrice(0);
                    }
                } catch (error) {
                    setCurrentMarketPrice(0);
                } finally {
                    setFetchingPrice(false);
                }
            }, 600); // 600ms debounce

            return () => clearTimeout(timer);
        } else {
            setCurrentMarketPrice(0);
            setFetchingPrice(false);
        }
    }, [symbol]);

    // ✅ Calculation Logic
    const activePrice = orderType === 'LIMIT' ? Number(limitPrice) : currentMarketPrice;
    const estimatedTotal = Number(quantity) * (activePrice || 0);
    const isInsufficientFunds = side === 'BUY' && estimatedTotal > walletBalance && activePrice > 0;

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

                    // Refresh balance after a successful trade
                    getWalletBalance().then(bal => setWalletBalance(Number(bal))).catch(console.error);

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

        // ✅ Prevent trade if funds are insufficient
        if (isInsufficientFunds) {
            return toast.error("Insufficient wallet balance for this trade");
        }

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
        <div className="relative w-full min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-orange-100 selection:text-orange-600">

            {/* AMBIENT BACKGROUND BLOBS */}
            <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-orange-300/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-rose-300/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-20 space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >

                {/* Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl text-white shadow-sm">
                                <Activity size={18} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Execution Engine</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Trade Center</h1>
                    </div>
                    <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-2xl font-bold text-sm border border-emerald-100">
                        <ShieldCheck size={18} />
                        <span>Protected by ProGuard Security</span>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT PANEL: Context & Stats */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Market Snapshot Card */}
                        <motion.div variants={itemVariants} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group border border-slate-700/50">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Global Index</p>
                                        <h2 className="text-3xl font-black tracking-tight">NIFTY 50</h2>
                                    </div>
                                    <div className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-black border border-white/10 backdrop-blur-md">
                                        LIVE
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black tracking-tighter font-mono bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">22,450.00</span>
                                    <div className="flex items-center bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-black">
                                        <TrendingUp size={16} className="mr-1" strokeWidth={3} />
                                        +0.85%
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-700/50 flex justify-between">
                                    <div className="space-y-1">
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Day High</p>
                                        <p className="font-bold font-mono text-lg text-white">22,510.20</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Day Low</p>
                                        <p className="font-bold font-mono text-lg text-slate-300">22,380.45</p>
                                    </div>
                                </div>
                            </div>

                            {/* Background Shapes */}
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-orange-500/10 rounded-full blur-[60px]"></div>
                        </motion.div>

                        {/* Buying Power Card */}
                        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-2xl rounded-[32px] p-8 border border-white shadow-xl shadow-slate-200/50 group block">
                            <div className="flex items-center gap-4 mb-5">
                                <div className="p-4 bg-orange-50 rounded-2xl text-orange-600 shadow-inner group-hover:scale-110 transition-transform">
                                    <IndianRupee size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Buying Power</p>
                                    <h3 className="text-3xl font-black text-slate-900 mt-1">
                                        <PriceDisplay value={walletBalance} showCurrency={true} />
                                    </h3>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-6 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-orange-400 to-rose-500 w-3/4 rounded-full" />
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT PANEL: Order Ticket */}
                    <motion.div variants={itemVariants} className="lg:col-span-7">
                        <div className="bg-white/60 backdrop-blur-2xl rounded-[32px] shadow-xl shadow-slate-200/50 border border-white overflow-hidden flex flex-col h-full">

                            {/* Tabs Header */}
                            <div className="flex p-4 bg-slate-50/50 gap-3 border-b border-slate-100">
                                <button
                                    onClick={() => setSide('BUY')}
                                    className={clsx(
                                        "flex-1 py-4 rounded-2xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300",
                                        side === 'BUY'
                                            ? "bg-emerald-600 border-none text-white shadow-lg shadow-emerald-600/20 transform scale-100"
                                            : "text-slate-500 bg-white border border-slate-200 hover:border-slate-300 transform scale-95 opacity-80"
                                    )}
                                >
                                    <TrendingUp size={16} strokeWidth={3} /> BUY ASSET
                                </button>
                                <button
                                    onClick={() => setSide('SELL')}
                                    className={clsx(
                                        "flex-1 py-4 rounded-2xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300",
                                        side === 'SELL'
                                            ? "bg-rose-600 border-none text-white shadow-lg shadow-rose-600/20 transform scale-100"
                                            : "text-slate-500 bg-white border border-slate-200 hover:border-slate-300 transform scale-95 opacity-80"
                                    )}
                                >
                                    <TrendingDown size={16} strokeWidth={3} /> SELL ASSET
                                </button>
                            </div>

                            <form onSubmit={handleTrade} className="p-8 md:p-10 space-y-8 flex-1 flex flex-col">

                                {/* Order Type Radio Group */}
                                <div className="flex bg-slate-100/80 rounded-2xl p-1.5 shadow-inner">
                                    {['MARKET', 'LIMIT'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setOrderType(type)}
                                            className={clsx(
                                                "flex-1 py-3 text-[10px] font-black tracking-widest rounded-xl transition-all duration-300",
                                                orderType === type
                                                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                                                    : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {type} ORDER
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-8 flex-1">
                                    {/* Symbol Input */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end mb-1">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Stock Symbol</label>

                                            {/* ✅ Live Market Price Display */}
                                            {symbol.length > 0 && (
                                                <div className="text-[10px] font-black text-orange-600 tracking-wider bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                                                    {fetchingPrice ? 'FETCHING...' : currentMarketPrice > 0 ? `LTP: ₹${currentMarketPrice}` : 'NO DATA'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={symbol}
                                                onChange={e => setSymbol(e.target.value.toUpperCase())}
                                                placeholder="SEARCH TICKER (e.g. RELIANCE)"
                                                className="w-full text-4xl font-black tracking-tighter border-b-[6px] border-slate-200 bg-transparent pb-4 focus:border-orange-500 outline-none uppercase placeholder-slate-300 text-slate-900 transition-colors"
                                                required
                                            />
                                            <div className="absolute right-0 bottom-6">
                                                <Zap className={clsx("transition-colors", fetchingPrice ? "text-slate-300 animate-pulse" : "text-orange-500")} size={32} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quantity & Price Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Quantity</label>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={e => setQuantity(e.target.value)}
                                                min="1"
                                                className="w-full p-5 rounded-[20px] border-2 border-slate-200 bg-white text-3xl font-black font-mono text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
                                                required
                                            />
                                        </div>

                                        <AnimatePresence mode="popLayout">
                                            {orderType === 'LIMIT' && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="space-y-3"
                                                >
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Limit Price</label>
                                                    <input
                                                        type="number"
                                                        value={limitPrice}
                                                        onChange={e => setLimitPrice(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full p-5 rounded-[20px] border-2 border-slate-200 bg-white text-3xl font-black font-mono text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
                                                        required
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="mt-auto space-y-6 pt-6">
                                    {/* ✅ Order Summary Block */}
                                    <div className={clsx(
                                        "rounded-3xl p-6 flex justify-between items-center transition-all duration-300 shadow-inner",
                                        isInsufficientFunds ? "bg-rose-50 border border-rose-200" : "bg-slate-50 border border-slate-200"
                                    )}>
                                        <div className="space-y-1">
                                            <p className={clsx(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                isInsufficientFunds ? "text-rose-600/70" : "text-slate-500"
                                            )}>Estimated Value</p>

                                            <p className={clsx(
                                                "text-3xl font-black font-mono tracking-tight",
                                                isInsufficientFunds ? "text-rose-600" : "text-slate-900"
                                            )}>
                                                {estimatedTotal > 0 ? `₹${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'MARKET PRICE'}
                                            </p>

                                            {/* Warning Message if funds are too low */}
                                            {isInsufficientFunds && (
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 mt-3 bg-white px-3 py-1.5 rounded-lg w-max border border-rose-100 shadow-sm">
                                                    <AlertCircle size={14} />
                                                    Insufficient Wallet Balance
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className={clsx(
                                                "text-[10px] font-black uppercase tracking-widest flex justify-end",
                                                isInsufficientFunds ? "text-rose-600/70" : "text-slate-500"
                                            )}>Taxes & Charges</p>
                                            <p className={clsx("font-black text-lg", isInsufficientFunds ? "text-rose-600" : "text-slate-900")}>₹0.00</p>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        disabled={loading || isInsufficientFunds}
                                        className={clsx(
                                            "w-full py-6 rounded-3xl font-black text-xl text-white shadow-xl transform transition-all flex items-center justify-center gap-3",
                                            isInsufficientFunds
                                                ? "bg-slate-300 shadow-none cursor-not-allowed text-slate-500"
                                                : side === 'BUY'
                                                    ? "bg-slate-900 shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-600/30 hover:-translate-y-1 active:translate-y-0"
                                                    : "bg-slate-900 shadow-slate-900/20 hover:bg-rose-600 hover:shadow-rose-600/30 hover:-translate-y-1 active:translate-y-0"
                                        )}
                                    >
                                        {loading ? <RefreshCw className="animate-spin" size={24} /> : (
                                            <>
                                                {isInsufficientFunds ? "INSUFFICIENT FUNDS" : `EXECUTE ${side}`}
                                                {!isInsufficientFunds && <ArrowRight strokeWidth={4} size={24} />}
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pt-2">
                                        <Clock size={14} strokeWidth={3} />
                                        <span>GTC: Good Till Cancelled</span>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}