import { useState, useEffect } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { RefreshCw, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';

export default function Trade() {
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [side, setSide] = useState('BUY');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // SSE Listener
    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('token');
        const eventSource = new EventSource(`/api/orders/stream?token=${token}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'UPDATE') {
                if (data.status === 'EXECUTED') {
                    toast.success(`Order Executed! ${data.side} ${data.symbol} @ ₹${data.price}`);
                } else if (data.status === 'FAILED') {
                    toast.error(`Order Failed: ${data.reason}`);
                }
            }
        };

        return () => eventSource.close();
    }, [user]);

    const handleTrade = async (e) => {
        e.preventDefault();
        if (!symbol) return toast.error("Please enter a symbol");
        
        setLoading(true);
        const toastId = toast.loading("Placing order...");

        try {
            const endpoint = side === 'BUY' ? '/orders/buy' : '/orders/sell';
            await api.post(endpoint, {
                symbol: symbol.toUpperCase(),
                quantity: parseInt(quantity),
                orderType: 'MARKET'
            });
            
            toast.success("Order Placed Successfully", { id: toastId });
            setSymbol('');
            setQuantity(1);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Trade failed', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-8 px-4 animate-fade-in">
            <Card className="overflow-hidden shadow-2xl border-0">
                {/* Toggle Buy/Sell */}
                <div className="grid grid-cols-2">
                    <button 
                        onClick={() => setSide('BUY')}
                        className={clsx(
                            "py-6 text-center font-bold tracking-widest transition-all flex justify-center items-center gap-2",
                            side === 'BUY' 
                                ? "bg-emerald-600 text-white shadow-inner" 
                                : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                    >
                        <TrendingUp size={20} /> BUY
                    </button>
                    <button 
                        onClick={() => setSide('SELL')}
                        className={clsx(
                            "py-6 text-center font-bold tracking-widest transition-all flex justify-center items-center gap-2",
                            side === 'SELL' 
                                ? "bg-rose-600 text-white shadow-inner" 
                                : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                    >
                        <TrendingDown size={20} /> SELL
                    </button>
                </div>

                <div className="p-8 bg-white dark:bg-gray-900">
                    <div className="text-center mb-8">
                        <h2 className={`text-2xl font-black mb-2 ${side === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {side === 'BUY' ? 'Buy Stock' : 'Sell Stock'}
                        </h2>
                        <p className="text-gray-500 text-sm">Market Order Execution</p>
                    </div>

                    <form onSubmit={handleTrade} className="space-y-6">
                        <Input
                            label="TICKER SYMBOL"
                            value={symbol}
                            onChange={e => setSymbol(e.target.value.toUpperCase())}
                            placeholder="e.g. RELIANCE"
                            className="uppercase font-mono text-lg font-bold"
                            required
                        />

                        <Input
                            label="QUANTITY"
                            type="number"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            min="1"
                            className="font-mono text-lg font-bold"
                            required
                        />

                        <button 
                            disabled={loading}
                            className={clsx(
                                "w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transform transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:transform-none flex items-center justify-center gap-2 mt-4",
                                side === 'BUY' ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200" : "bg-rose-600 hover:bg-rose-500 shadow-rose-200"
                            )}
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : <>Place {side} Order <ArrowRight /></>}
                        </button>
                    </form>
                </div>
            </Card>
            
            <p className="text-center text-gray-400 text-xs mt-6">
                * Orders are executed immediately at market price.
            </p>
        </div>
    );
}