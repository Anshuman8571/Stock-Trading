import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper to handle successful auth responses
    const handleAuthSuccess = (data) => {
        const { accessToken, user } = data;
        
        // 1. Save to Local Storage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // 2. Set Default Header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // 3. Update State (Critical for ProtectedRoute)
        setUser(user);
        
        return { success: true };
    };

    // Initialize state on load
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                // Restore session immediately to prevent flicker
                setUser(JSON.parse(savedUser));
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            if (token) {
                try {
                    // Verify with backend
                    const { data } = await api.get('/user/me');
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                } catch (error) {
                    console.error("Session verification failed:", error);
                    logout(); // Clean up if token is invalid
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            return handleAuthSuccess(data);
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || error.response?.data?.error || 'Login failed' 
            };
        }
    };

    const pinLogin = async (email, pin) => {
        try {
            const { data } = await api.post('/auth/pin/login', { email, pin });
            return handleAuthSuccess(data);
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || error.response?.data?.error || 'PIN Login failed' 
            };
        }
    };
    
    const googleLogin = async (credential) => {
        try {
            const { data } = await api.post('/auth/google', { token: credential });
            return handleAuthSuccess(data);
        } catch (error) {
             return { 
                success: false, 
                message: error.response?.data?.message || 'Google Login failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, pinLogin, googleLogin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);