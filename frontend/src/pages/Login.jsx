import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, TrendingUp, Zap, PieChart, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Login() {
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleGoogleLogin = () => {
        if (!window.google) {
            toast.error('Google login service is loading. Please try again in a moment.');
            return;
        }

        const clientId = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID
            ? import.meta.env.VITE_GOOGLE_CLIENT_ID
            : 'YOUR_GOOGLE_CLIENT_ID';

        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile',
            callback: async (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    setLoading(true);
                    try {
                        const result = await googleLogin(tokenResponse.access_token);
                        if (result && result.success) {
                            toast.success('Welcome to ProTrader');
                            navigate(from, { replace: true });
                        } else {
                            toast.error(result?.message || 'Google authentication failed');
                        }
                    } catch (err) {
                        toast.error('Google authentication failed');
                    } finally {
                        setLoading(false);
                    }
                }
            },
            error_callback: () => {
                toast.error('Google Login Failed or Cancelled');
            }
        });

        client.requestAccessToken();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));

        const result = await login(formData.email, formData.password);
        setLoading(false);

        if (result.success) {
            toast.success('Welcome to ProTrader');
            navigate(from, { replace: true });
        } else {
            toast.error(result.message || 'Invalid credentials');
        }
    };

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
        <div className="w-full min-h-screen flex bg-slate-50 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-600 overflow-hidden relative">

            {/* AMBIENT BACKGROUND BLOBS */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-orange-300/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-rose-300/20 rounded-full blur-[120px] pointer-events-none" />

            {/* LEFT SIDE: Brand & Visuals */}
            <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-between p-16 overflow-hidden">
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="relative z-10 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl shadow-lg shadow-orange-500/20">
                        <TrendingUp size={24} className="text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-slate-900">ProTrader</span>
                </motion.div>

                <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 w-full max-w-md mx-auto space-y-10">
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h1 className="text-6xl font-black leading-[1.1] tracking-tight">
                            Smart investing.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Pro results.</span>
                        </h1>
                        <p className="text-lg text-slate-600 font-bold leading-relaxed max-w-sm">
                            Join 50K+ traders using Omni Agent AI to instantly analyze and outperform the market.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-6">
                        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-2xl p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/50 hover:bg-white/80 transition-all duration-300">
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-4 shadow-inner">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <h3 className="font-black text-slate-900 text-lg">Real-Time Data</h3>
                            <p className="text-sm text-slate-500 mt-1 font-bold">Zero latency quotes</p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-2xl p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/50 hover:bg-white/80 transition-all duration-300 mt-8">
                            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-4 shadow-inner">
                                <PieChart size={24} />
                            </div>
                            <h3 className="font-black text-slate-900 text-lg">AI Omni Agent</h3>
                            <p className="text-sm text-slate-500 mt-1 font-bold">Deep portfolio analysis</p>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative z-10 flex items-center gap-3 text-slate-500 text-sm font-black uppercase tracking-widest">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <span>Bank-Grade Encryption</span>
                </motion.div>
            </div>

            {/* RIGHT SIDE: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative z-10">
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[440px] bg-white/60 backdrop-blur-3xl p-10 md:p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white relative">

                    <motion.div variants={itemVariants} className="space-y-3 mb-10">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 font-bold">
                            New here? <Link to="/register" className="text-orange-600 hover:text-orange-700 transition-colors">Create an account</Link>
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        {/* Functional Google Button */}
                        <motion.button
                            variants={itemVariants}
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-800 font-black py-4 px-4 rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            CONTINUE WITH GOOGLE
                        </motion.button>

                        <motion.div variants={itemVariants} className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]"><span className="px-4 bg-slate-50 rounded-full text-slate-400 border border-slate-200">Or email logic</span></div>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-bold placeholder-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200 shadow-sm"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-2">
                                <div className="flex justify-between items-center ml-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Password</label>
                                    <a href="#" className="text-xs font-black text-orange-600 hover:text-orange-700 transition-colors">Forgot?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-14 pr-14 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-bold tracking-widest placeholder-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200 shadow-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-slate-900 hover:bg-orange-600 active:bg-orange-700 text-white font-black tracking-widest text-sm rounded-2xl shadow-xl shadow-slate-900/20 disabled:opacity-70 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <>SIGN IN <ArrowRight size={20} strokeWidth={3} /></>}
                            </motion.button>
                        </form>
                    </div>

                    <motion.div variants={itemVariants} className="pt-8 text-center">
                        <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-[280px] mx-auto">
                            By signing in, you agree to our <a href="#" className="text-slate-900 hover:text-orange-600 underline">Terms</a> & <a href="#" className="text-slate-900 hover:text-orange-600 underline">Privacy Policy</a>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}