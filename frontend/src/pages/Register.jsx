import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { UserPlus, User, Phone, Mail, Lock } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-emerald-100">
                <div className="flex justify-center mb-6">
                    <div className="bg-emerald-100 p-3 rounded-full">
                        <UserPlus className="text-emerald-600" size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-emerald-900 mb-6">Create Account</h2>
                
                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input name="fullName" placeholder="Full Name" onChange={handleChange} required 
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900" />
                    </div>

                    {/* Username */}
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input name="username" placeholder="Username" onChange={handleChange} required 
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900" />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required 
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900" />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                        <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} required 
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900" />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        <input type="password" name="password" placeholder="Password" onChange={handleChange} required 
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900" />
                    </div>

                    <button disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-200">
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}