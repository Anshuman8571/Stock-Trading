import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; 
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, TrendingUp, Zap, PieChart, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    // Destructuring googleLogin from AuthContext
    const { login, googleLogin } = useAuth(); 
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Dynamically load Google Identity Services to bypass build resolution errors
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

    // Actual Google Login Flow using Native API
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
        
        // Simulate network feel for smoother UX
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

    return (
        <div className="w-full min-h-screen flex bg-white font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-600">
            
            {/* LEFT SIDE: Brand & Visuals */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-50 flex-col justify-between p-16">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-100/50 rounded-full blur-[120px]" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2.5 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/20">
                        <TrendingUp size={24} className="text-white" />
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900">ProTrader</span>
                </div>

                <div className="relative z-10 w-full max-w-md mx-auto space-y-8">
                    <div className="space-y-6 mb-12">
                        <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight">
                            Simple investing.<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Pro results.</span>
                        </h1>
                        <p className="text-lg text-slate-600 font-medium leading-relaxed">
                            Join 50K+ traders using AI-driven insights to outperform the market. Zero commission.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:-translate-y-1 transition-all duration-300">
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">Lightning Fast</h3>
                            <p className="text-sm text-slate-500 mt-1 font-medium">10ms execution</p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:-translate-y-1 transition-all duration-300 mt-8">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                                <PieChart size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">AI Analytics</h3>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Smart rebalancing</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3 text-slate-500 text-sm font-medium">
                    <ShieldCheck size={18} className="text-orange-600" />
                    <span>ISO 27001 Certified & Secure</span>
                </div>
            </div>

            {/* RIGHT SIDE: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white relative overflow-y-auto">
                <div className="w-full max-w-[440px] animate-fade-in space-y-8">
                    
                    <div className="space-y-3">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 text-base">
                            New here? <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">Create an account</Link>
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Functional Google Button */}
                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-4 px-4 rounded-2xl transition-all duration-200 text-base disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="px-3 bg-white text-slate-400 font-bold tracking-wider">Or login with email</span></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="block text-sm font-bold text-slate-700">Password</label>
                                    <a href="#" className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline">Forgot password?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-200"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-lg rounded-2xl shadow-xl shadow-orange-600/20 focus:outline-none focus:ring-4 focus:ring-orange-600/20 disabled:opacity-70 disabled:shadow-none transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : <>Sign In <ArrowRight size={22} strokeWidth={2.5} /></>}
                            </button>
                        </form>
                    </div>

                    <div className="pt-4 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            By clicking "Sign In", you agree to our <a href="#" className="text-slate-700 font-bold hover:text-orange-600 underline decoration-slate-300 underline-offset-4 transition-colors">Terms</a> & <a href="#" className="text-slate-700 font-bold hover:text-orange-600 underline decoration-slate-300 underline-offset-4 transition-colors">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}