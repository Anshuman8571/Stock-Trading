import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { User, Phone, Mail, Lock, Eye, EyeOff, Loader2, TrendingUp, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '', username: '', email: '', phone: '', password: '', confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) return toast.error("Passwords do not match");

        setLoading(true);
        await new Promise(r => setTimeout(r, 800));

        try {
            await api.post('/auth/register', formData);
            toast.success('Account created successfully!');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        "Zero commission on mutual funds",
        "Omni Agent AI Analytics",
        "Bank-grade security encryption",
        "Real-time market tracking"
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="w-full min-h-screen flex bg-slate-50 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-600 overflow-hidden relative">

            {/* AMBIENT BACKGROUND BLOBS */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-300/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-orange-300/20 rounded-full blur-[120px] pointer-events-none" />

            {/* LEFT SIDE: Visuals & Benefits */}
            <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-between p-16 overflow-hidden">
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="relative z-10 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl shadow-lg shadow-orange-500/20">
                        <TrendingUp size={24} className="text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-slate-900">ProTrader</span>
                </motion.div>

                <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 w-full max-w-lg mx-auto space-y-12">
                    <motion.div variants={itemVariants}>
                        <h1 className="text-6xl font-black leading-[1.1] tracking-tight mb-6">
                            Start building<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">real wealth.</span>
                        </h1>
                        <p className="text-lg text-slate-600 font-bold max-w-md">Open your account in seconds and unlock enterprise-level analytics for your personal portfolio.</p>
                    </motion.div>

                    <div className="space-y-5">
                        {benefits.map((benefit, index) => (
                            <motion.div variants={itemVariants} key={index} className="flex items-center gap-5 group p-4 rounded-3xl hover:bg-white/60 backdrop-blur-md border border-transparent hover:border-white shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-inner flex items-center justify-center text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                    <CheckCircle2 size={24} />
                                </div>
                                <span className="text-lg text-slate-600 font-bold group-hover:text-slate-900 transition-colors">{benefit}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative z-10 flex items-center gap-3 text-slate-500 text-sm font-black uppercase tracking-widest">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <span>Regulated & Compliant</span>
                </motion.div>
            </div>

            {/* RIGHT SIDE: Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[540px] bg-white/60 backdrop-blur-3xl p-8 md:p-12 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white relative my-10">

                    <motion.div variants={itemVariants} className="space-y-3 mb-10">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Create Account</h2>
                        <p className="text-slate-500 font-bold text-base">
                            Already a member? <Link to="/login" className="text-orange-600 hover:text-orange-700 transition-colors">Sign in here</Link>
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input type="text" name="fullName" onChange={handleChange} required
                                        className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-bold placeholder-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200 shadow-sm"
                                        placeholder="John Doe" />
                                </div>
                            </motion.div>
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input type="text" name="username" onChange={handleChange} required
                                        className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-bold placeholder-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200 shadow-sm"
                                        placeholder="johndoe" />
                                </div>
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                <input type="email" name="email" onChange={handleChange} required
                                    className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-bold placeholder-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200 shadow-sm"
                                    placeholder="name@example.com" />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                <input type="tel" name="phone" onChange={handleChange} required
                                    className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-bold placeholder-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200 shadow-sm"
                                    placeholder="+1 (555) 000-0000" />
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input type={showPassword ? "text" : "password"} name="password" onChange={handleChange} required
                                        className="w-full pl-14 pr-10 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-bold tracking-widest placeholder-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200 shadow-sm"
                                        placeholder="••••••" />
                                </div>
                            </motion.div>
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Confirm</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input type="password" name="confirmPassword" onChange={handleChange} required
                                        className="w-full pl-14 pr-12 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-bold tracking-widest placeholder-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200 shadow-sm"
                                        placeholder="••••••" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants} className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-slate-900 hover:bg-orange-600 active:bg-orange-700 text-white font-black tracking-widest uppercase text-sm rounded-2xl shadow-xl shadow-slate-900/20 disabled:opacity-70 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <>CREATE SECURE ACCOUNT <ArrowRight size={20} strokeWidth={3} /></>}
                            </button>
                        </motion.div>
                    </form>

                    <motion.div variants={itemVariants} className="pt-6 text-center">
                        <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-[280px] mx-auto">
                            By registering, you accept our <a href="#" className="text-slate-900 hover:text-orange-600 underline">Terms</a> & <a href="#" className="text-slate-900 hover:text-orange-600 underline">Privacy Policy</a>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}