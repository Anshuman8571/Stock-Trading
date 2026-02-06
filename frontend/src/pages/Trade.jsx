import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { RefreshCw, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function Trade() {
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [side, setSide] = useState('BUY');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // SETUP REAL-TIME LISTENERS
    useEffect(() => {
        if (!user) return;
        
        // Connect to the backend stream
        const eventSource = new EventSource(`/api/orders/stream?token=${localStorage.getItem('token')}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // Handle Order Updates
            if (data.type === 'UPDATE') {
                if (data.status === 'EXECUTED') {
                    toast.success(
                        <div className="flex flex-col">
                            <span className="font-bold">Order Executed!</span>
                            <span className="text-sm">Bought {data.side} {data.symbol} @ ₹{data.price}</span>
                        </div>, 
                        { duration: 5000, icon: '🚀' }
                    );
                } else if (data.status === 'FAILED') {
                    toast.error(
                        <div className="flex flex-col">
                            <span className="font-bold">Order Failed</span>
                            <span className="text-sm">{data.reason}</span>
                        </div>,
                        { duration: 5000 }
                    );
                }
            }
        };

        return () => {
            eventSource.close();
        };
    }, [user]);

    const handleTrade = async (e) => {
        e.preventDefault();
        if (!symbol) return toast.error("Please enter a symbol");
        
        setLoading(true);
        // We do NOT show "Executed" here. We only show "Submitted".
        const toastId = toast.loading("Submitting order to exchange...");

        try {
            const endpoint = side === 'BUY' ? '/orders/buy' : '/orders/sell';
            await api.post(endpoint, {
                symbol,
                quantity: parseInt(quantity),
                orderType: 'MARKET'
            });
            
            // Update the loading toast to success (Pending state)
            toast.success("Order Placed. Status: PENDING", { id: toastId });
            
            setSymbol('');
            setQuantity(1);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Trade failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-12 px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
                <div className="grid grid-cols-2 border-b border-gray-100">
                    <button 
                        onClick={() => setSide('BUY')}
                        className={clsx(
                            "py-4 text-center font-bold text-sm tracking-widest transition-colors flex justify-center items-center gap-2",
                            side === 'BUY' ? "bg-emerald-600 text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        )}
                    >
                        <TrendingUp size={18} /> BUY
                    </button>
                    <button 
                        onClick={() => setSide('SELL')}
                        className={clsx(
                            "py-4 text-center font-bold text-sm tracking-widest transition-colors flex justify-center items-center gap-2",
                            side === 'SELL' ? "bg-rose-600 text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        )}
                    >
                        <TrendingDown size={18} /> SELL
                    </button>
                </div>

                <div className="p-8 bg-gradient-to-b from-white to-gray-50">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                        {side === 'BUY' ? 'Buy Stock' : 'Sell Stock'}
                    </h2>
                    <p className="text-center text-gray-500 mb-8 text-sm">Enter details to execute a market order</p>

                    <form onSubmit={handleTrade} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Ticker Symbol</label>
                            <input 
                                type="text" 
                                value={symbol} 
                                onChange={e => setSymbol(e.target.value.toUpperCase())}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all uppercase font-bold text-gray-900 text-lg placeholder-gray-300"
                                placeholder="e.g. RELIANCE" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Quantity</label>
                            <input 
                                type="number" 
                                value={quantity} 
                                onChange={e => setQuantity(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-bold text-gray-900 text-lg placeholder-gray-300"
                                min="1" 
                                required 
                            />
                        </div>

                        <div className="pt-4">
                            <button 
                                disabled={loading}
                                className={clsx(
                                    "w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl transform transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                                    side === 'BUY' ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200" : "bg-rose-600 hover:bg-rose-500 shadow-rose-200"
                                )}
                            >
                                {loading ? <RefreshCw className="animate-spin" /> : <>Place Order <ArrowRight size={20} /></>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <p className="text-center text-emerald-700/60 mt-6 text-sm">
                Market orders are executed at the best available price. <br/>Currency: INR (₹)
            </p>
        </div>
    );
}