import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2, TrendingUp, Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                toast.success('Welcome back!', {
                    duration: 3000,
                    icon: '👋',
                });
                navigate(from, { replace: true });
            } else {
                setError(result.message || 'Login failed');
                toast.error(result.message || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');

        try {
            const result = await googleLogin(credentialResponse.credential);

            if (result.success) {
                toast.success('Welcome!', {
                    duration: 3000,
                    icon: '🚀',
                });
                navigate(from, { replace: true });
            } else {
                setError(result.message || 'Google login failed');
                toast.error(result.message || 'Google login failed');
            }
        } catch (error) {
            setError('Google login failed');
            toast.error('Google login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        toast.error('Google login failed. Please try again.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 dark:from-gray-950 dark:via-primary-950 dark:to-gray-900 transition-colors">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-scale-in">
                
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-cyan-600 rounded-2xl shadow-2xl mb-6 glow-cyan">
                        <TrendingUp className="text-white" size={36} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-bold text-text-primary mb-2 tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-text-secondary">
                        Sign in to access your trading account
                    </p>
                </div>

                {/* Login Card */}
                <div className="card-glass p-8">
                    
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-loss/10 border border-loss/30 rounded-xl animate-slide-down">
                            <p className="text-sm text-loss font-medium flex items-center gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-loss rounded-full flex items-center justify-center text-white text-xs">!</span>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-border-primary bg-bg-primary text-text-primary placeholder-text-tertiary focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-border-primary bg-bg-primary text-text-primary placeholder-text-tertiary focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-primary-600 to-cyan-600 hover:from-primary-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border-primary"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-bg-primary text-text-tertiary font-medium">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline"
                            size="large"
                            text="signin_with"
                            shape="rectangular"
                            width="100%"
                        />
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-8 text-center space-y-3">
                    <p className="text-sm text-text-secondary">
                        Don't have an account?{' '}
                        <Link 
                            to="/register" 
                            className="text-primary-600 dark:text-primary-400 font-bold hover:underline transition-colors inline-flex items-center gap-1"
                        >
                            Create Account
                            <Sparkles size={14} />
                        </Link>
                    </p>
                    <p className="text-xs text-text-tertiary">
                        <a href="#" className="hover:text-primary-600 transition-colors">
                            Forgot your password?
                        </a>
                    </p>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 flex items-center justify-center gap-6 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-profit rounded-full"></div>
                        Secure Login
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        256-bit Encryption
                    </span>
                </div>
            </div>
        </div>
    );
}