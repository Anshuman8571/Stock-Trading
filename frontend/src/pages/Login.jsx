import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Hash, Loader2, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const [step, setStep] = useState('email'); // 'email', 'password', 'pin'
    
    // 1. Get auth methods from Context
    const { login, pinLogin, googleLogin } = useAuth(); 
    
    const navigate = useNavigate();
    const location = useLocation();
    
    // 2. Determine where to go after login (Dashboard by default)
    const from = location.state?.from?.pathname || '/';
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('');
    
    const [hasPIN, setHasPIN] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Check if entered email has PIN enabled
    const checkEmailForPIN = async (emailToCheck) => {
        try {
            const { data } = await api.get(`/auth/pin/check?email=${encodeURIComponent(emailToCheck)}`);
            if (data.exists && data.pin_enabled) {
                setHasPIN(true);
            } else {
                setHasPIN(false);
            }
        } catch (err) {
            setHasPIN(false);
        }
    };

    // When email is entered and user clicks Next
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        await checkEmailForPIN(email);
        setLoading(false);
        
        if (hasPIN) {
            setStep('choice');
        } else {
            setStep('password');
        }
    };

    // ============================================
    // EMAIL/PASSWORD LOGIN (FIXED)
    // ============================================
    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // 3. Use Context login() instead of direct API call
            // This ensures the global 'user' state is updated
            const result = await login(email, password);
            
            if (result.success) {
                toast.success('Login successful!');
                // 4. Navigate using the 'from' location
                navigate(from, { replace: true });
            } else {
                setError(result.message);
                toast.error(result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // QUICK LOGIN WITH PIN (FIXED)
    // ============================================
    const handlePINLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // 5. Use Context pinLogin()
            const result = await pinLogin(email, pin);
            
            if (result.success) {
                toast.success('Quick login successful!');
                navigate(from, { replace: true });
            } else {
                setError(result.message);
                toast.error(result.message);
                setPin(''); 
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const result = await googleLogin(credentialResponse.credential);
            if (result.success) {
                navigate(from, { replace: true });
                toast.success('Welcome back!');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Google login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg mb-4">
                        <LogIn className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome Back</h1>
                    <p className="text-emerald-600 dark:text-emerald-400 mt-2">Sign in to continue trading</p>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700/50 rounded-lg">
                            <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{error}</p>
                        </div>
                    )}

                    {/* STEP 1: EMAIL INPUT */}
                    {step === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        placeholder="you@example.com"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Next <ArrowRight size={20} /></>}
                            </button>
                            
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-dark-border-primary"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error('Google Login Failed')}
                                    theme="filled_blue"
                                    shape="pill"
                                />
                            </div>
                        </form>
                    )}

                    {/* STEP 2: CHOICE (Password or PIN) */}
                    {step === 'choice' && (
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Logging in as <span className="font-bold text-gray-900 dark:text-white">{email}</span></p>
                                <button onClick={() => setStep('email')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1">Change email</button>
                            </div>

                            <button onClick={() => setStep('pin')} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2">
                                <Hash size={20} /> Login with PIN
                            </button>

                            <button onClick={() => setStep('password')} className="w-full py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2">
                                <Lock size={20} /> Login with Password
                            </button>
                        </div>
                    )}

                    {/* STEP 3: PASSWORD INPUT */}
                    {step === 'password' && (
                        <form onSubmit={handlePasswordLogin} className="space-y-6">
                             <div className="text-center mb-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Logging in as <span className="font-bold text-gray-900 dark:text-white">{email}</span></p>
                                <button type="button" onClick={() => setStep('email')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1">Change email</button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                        placeholder="••••••••"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2">
                                {loading ? <><Loader2 className="animate-spin" size={20} /> Signing In...</> : <><LogIn size={20} /> Sign In</>}
                            </button>

                            {hasPIN && (
                                <button type="button" onClick={() => setStep('choice')} className="w-full text-sm text-emerald-600 dark:text-emerald-400 hover:underline mt-4">
                                    Back to login options
                                </button>
                            )}
                        </form>
                    )}

                    {/* STEP 4: PIN INPUT */}
                    {step === 'pin' && (
                        <form onSubmit={handlePINLogin} className="space-y-6">
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Logging in as <span className="font-bold text-gray-900 dark:text-white">{email}</span></p>
                                <button type="button" onClick={() => setStep('choice')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1">Use different method</button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">Enter your 4-digit PIN</label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="w-full px-4 py-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-3xl tracking-[1em] font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    placeholder="••••"
                                    maxLength="4"
                                    required
                                    autoFocus
                                />
                            </div>

                            <button type="submit" disabled={loading || pin.length !== 4} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <><Loader2 className="animate-spin" size={20} /> Verifying...</> : 'Login'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account? <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Create Account</Link>
                </p>
            </div>
        </div>
    );
}