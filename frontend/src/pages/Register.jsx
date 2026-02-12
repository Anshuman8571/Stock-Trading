import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { User, Phone, Mail, Lock, Eye, EyeOff, Loader2, TrendingUp, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

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
        // Simulate network delay for better UX
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
        "Real-time market analytics",
        "Bank-grade security encryption",
        "24/7 Priority support"
    ];

    return (
        <div className="w-full min-h-screen flex bg-white font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-600">
            
            {/* LEFT SIDE: Visuals & Benefits */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-50 flex-col justify-between p-16">
                
                {/* Ambient Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-100/50 rounded-full blur-[120px]" />

                {/* Brand Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2.5 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/20">
                        <TrendingUp size={24} className="text-white" />
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900">ProTrader</span>
                </div>

                {/* Center Content */}
                <div className="relative z-10 w-full max-w-lg mx-auto space-y-10">
                    <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight">
                        Start your journey<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">to financial freedom.</span>
                    </h1>
                    
                    <div className="space-y-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-4 group p-3 rounded-xl hover:bg-white/60 transition-colors cursor-default">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-orange-600 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                                    <CheckCircle2 size={22} />
                                </div>
                                <span className="text-lg text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="relative z-10 flex items-center gap-3 text-slate-500 text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
                    <ShieldCheck size={18} className="text-orange-600" />
                    <span>Regulated & Secure Platform</span>
                </div>
            </div>

            {/* RIGHT SIDE: Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white relative overflow-y-auto">
                <div className="w-full max-w-[520px] animate-fade-in space-y-8 my-auto py-8">
                    
                    <div className="space-y-3">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h2>
                        <p className="text-slate-500 text-base font-medium">
                            Already a member? <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors">Sign in</Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input type="text" name="fullName" onChange={handleChange} required 
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                        placeholder="John Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input type="text" name="username" onChange={handleChange} required 
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                        placeholder="johndoe123" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                <input type="email" name="email" onChange={handleChange} required 
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                    placeholder="name@example.com" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                <input type="tel" name="phone" onChange={handleChange} required 
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                    placeholder="+1 (555) 000-0000" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input type={showPassword ? "text" : "password"} name="password" onChange={handleChange} required 
                                        className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                        placeholder="••••••" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Confirm</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input type="password" name="confirmPassword" onChange={handleChange} required 
                                        className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                        placeholder="••••••" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-lg rounded-2xl shadow-xl shadow-orange-600/20 focus:outline-none focus:ring-4 focus:ring-orange-600/20 disabled:opacity-70 disabled:shadow-none transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : <>Create Account <ArrowRight size={22} strokeWidth={2.5} /></>}
                            </button>
                        </div>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                            By registering, you accept our <a href="#" className="text-slate-600 underline hover:text-orange-600 transition-colors">Terms of Service</a> and <a href="#" className="text-slate-600 underline hover:text-orange-600 transition-colors">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}