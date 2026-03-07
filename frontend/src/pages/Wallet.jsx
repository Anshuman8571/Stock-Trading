import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWalletBalance, initiateDeposit, verifyDeposit } from '../services/walletService';
import toast from 'react-hot-toast';
import { Wallet as WalletIcon, TrendingUp, ShieldCheck, CreditCard, ArrowRight, Lock, Loader2 } from 'lucide-react';
import PriceDisplay from '../components/trading/PriceDisplay';
import { motion, AnimatePresence } from 'framer-motion';

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
        if (!amount || Number(amount) <= 0) return toast.error("Please enter a valid amount");

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
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold text-sm tracking-widest uppercase animate-pulse">Syncing Wallet...</p>
                </div>
            </div>
        );
    }

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
                className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-20 space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >

                {/* Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl text-white shadow-sm">
                                <WalletIcon size={18} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Finance Hub</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">My Wallet</h1>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-2xl font-bold text-sm border border-emerald-100">
                        <ShieldCheck size={18} />
                        <span>Bank-Grade Security</span>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                    {/* LEFT: Balance Card */}
                    <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl shadow-slate-900/20 border border-slate-700/50">
                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[260px]">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-3">Available Buying Power</p>
                                    <h2 className="text-5xl font-black tracking-tight flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                                        <PriceDisplay value={balance} showCurrency={true} className="!text-transparent" />
                                    </h2>
                                </div>
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                                    <TrendingUp size={28} className="text-orange-400" />
                                </div>
                            </div>

                            <div className="mt-8 space-y-5">
                                <div className="flex items-center gap-3 text-sm text-slate-300 font-bold bg-white/5 w-max px-4 py-2 rounded-xl border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse border-2 border-emerald-400/50 box-content"></div>
                                    Live Wallet Status
                                </div>
                                <div className="pt-6 border-t border-slate-700/50 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Account Holder</p>
                                        <p className="font-black text-xl tracking-wide text-white">{user?.username || 'Trader'}</p>
                                    </div>
                                    <CreditCard size={36} className="text-slate-600" />
                                </div>
                            </div>
                        </div>

                        {/* Decorational Background Orbs */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-orange-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                    </motion.div>

                    {/* RIGHT: Deposit Form */}
                    <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-2xl rounded-[32px] shadow-xl shadow-slate-200/50 border border-white p-8 overflow-hidden h-full flex flex-col justify-center">
                        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
                            {step === 'INPUT' ? 'Add Funds' : 'Verify Transaction'}
                        </h3>

                        <AnimatePresence mode="wait">
                            {step === 'INPUT' ? (
                                <motion.form
                                    key="INPUT"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleDeposit}
                                    className="space-y-8"
                                >
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                            Amount (INR)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                                            <input
                                                type="number"
                                                placeholder="5,000"
                                                className="w-full pl-14 pr-6 py-5 rounded-[20px] border-2 border-slate-200 bg-white text-3xl font-black font-mono text-slate-900 placeholder-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                min="1"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex gap-3 mt-4">
                                            {[1000, 5000, 10000].map(val => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setAmount(val.toString())}
                                                    className="flex-1 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-500 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 transition-all shadow-sm active:scale-95"
                                                >
                                                    +₹{val.toLocaleString()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !amount}
                                        className="w-full py-6 bg-slate-900 hover:bg-emerald-600 hover:shadow-emerald-600/30 active:bg-emerald-700 text-white font-black text-xl rounded-3xl shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:hover:bg-slate-900 disabled:shadow-none transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={24} /> : <>DEPOSIT SECURELY <ArrowRight strokeWidth={4} size={24} /></>}
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="OTP_VERIFY"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleVerify}
                                    className="space-y-8"
                                >
                                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100/50 shadow-inner">
                                        <p className="text-sm text-emerald-800 font-bold text-center flex items-center justify-center gap-2">
                                            <ShieldCheck size={20} className="text-emerald-500" />
                                            OTP sent to registered phone.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                                            Enter 6-Digit Code
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                                            <input
                                                type="text"
                                                placeholder="••••••"
                                                className="w-full pl-16 pr-6 py-5 rounded-[20px] border-2 border-slate-200 bg-white text-3xl font-black font-mono text-center tracking-[1em] text-slate-900 placeholder-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                maxLength={6}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="w-full py-5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-black tracking-widest uppercase text-sm rounded-3xl transition-all shadow-sm active:scale-95"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || otp.length < 6}
                                            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase text-sm rounded-3xl shadow-xl shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95 disabled:hover:-translate-y-0"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : "VERIFY"}
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}