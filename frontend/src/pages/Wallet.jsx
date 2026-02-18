import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWalletBalance, initiateDeposit, verifyDeposit } from '../services/walletService';
import toast from 'react-hot-toast';
import { Wallet as WalletIcon, TrendingUp, ShieldCheck, CreditCard, ArrowRight, Lock, Loader2 } from 'lucide-react';
import PriceDisplay from '../components/trading/PriceDisplay';

export default function Wallet() {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('INPUT'); // INPUT, OTP_VERIFY
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const bal = await getWalletBalance();
            setBalance(Number(bal));
        } catch (err) {
            console.error("Failed to load balance", err);
            toast.error("Could not sync wallet balance");
        } finally {
            setFetching(false);
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return toast.error("Please enter a valid amount");
        
        setLoading(true);
        try {
            await initiateDeposit(Number(amount));
            toast.success("OTP sent to your registered phone");
            setStep('OTP_VERIFY');
        } catch (err) {
            toast.error(err.response?.data?.error || "Deposit failed");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6) return toast.error("Please enter valid 6-digit OTP");
        
        setLoading(true);
        try {
            const res = await verifyDeposit(otp);
            toast.success("Deposit Successful!");
            setBalance(Number(res.newBalance));
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.error || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep('INPUT');
        setAmount('');
        setOtp('');
    };

    if (fetching) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Syncing Wallet...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-screen bg-slate-50/50 font-sans text-slate-900 overflow-hidden selection:bg-orange-100 selection:text-orange-600">
            
            {/* AMBIENT BACKGROUND BLOBS */}
            <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-amber-100/50 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-20 space-y-8 animate-fade-in">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-orange-100 rounded-lg">
                                <WalletIcon size={18} className="text-orange-600" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Finance Hub</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">My Wallet</h1>
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm hidden sm:flex">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        <span>Bank-Grade Security</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* LEFT: Balance Card - ✅ UPDATED TO MATCH ORANGE THEME */}
                    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-orange-500 to-red-600 p-8 text-white shadow-xl shadow-orange-500/20">
                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-orange-100 font-bold text-xs uppercase tracking-widest mb-2">Total Available Balance</p>
                                    <h2 className="text-4xl font-black tracking-tight flex items-center gap-2">
                                        <PriceDisplay value={balance} showCurrency={true} className="text-white" />
                                    </h2>
                                </div>
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                    <TrendingUp size={24} className="text-white" />
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-orange-50 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    Live Wallet Status
                                </div>
                                <div className="pt-6 border-t border-white/20 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-orange-100 font-black uppercase tracking-widest">Account Holder</p>
                                        <p className="font-bold text-lg tracking-wide">{user?.username || 'Trader'}</p>
                                    </div>
                                    <CreditCard size={32} className="text-white/30" />
                                </div>
                            </div>
                        </div>

                        {/* Decorational Circles */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
                    </div>

                    {/* RIGHT: Deposit Form */}
                    <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            {step === 'INPUT' ? 'Add Funds' : 'Verify Transaction'}
                        </h3>

                        {step === 'INPUT' ? (
                            <form onSubmit={handleDeposit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Enter Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₹</span>
                                        <input 
                                            type="number" 
                                            placeholder="5,000" 
                                            className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-2xl font-black text-slate-900 placeholder-slate-300 focus:border-orange-500 focus:bg-white outline-none transition-all"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            min="1"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        {[1000, 5000, 10000].map(val => (
                                            <button 
                                                key={val}
                                                type="button"
                                                onClick={() => setAmount(val.toString())}
                                                className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-colors"
                                            >
                                                +₹{val.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={loading || !amount}
                                    className="w-full py-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-600/20 disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <>Deposit Securely <ArrowRight size={20} strokeWidth={3} /></>}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerify} className="space-y-6 animate-fade-in">
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 mb-4">
                                    <p className="text-sm text-orange-800 font-medium text-center">
                                        An OTP has been sent to your registered mobile number.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Enter OTP
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input 
                                            type="text" 
                                            placeholder="••••••" 
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-2xl font-black text-slate-900 placeholder-slate-300 focus:border-orange-500 focus:bg-white outline-none transition-all tracking-widest"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            maxLength={6}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button"
                                        onClick={resetForm}
                                        className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={loading || otp.length < 6}
                                        className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : "Verify"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}