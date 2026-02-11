import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Orders from './pages/Orders';
import AIAdvisor from './pages/AIAdvisor';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent"></div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
                </div>
            </div>
        );
    }
    
    return user ? children : <Navigate to="/login" replace />;
};

const Layout = ({ children }) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans transition-colors duration-200">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl pb-24 md:pb-8">
            {children}
        </main>
    </div>
);

export default function App() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    if (!googleClientId) {
        console.warn('Warning: VITE_GOOGLE_CLIENT_ID is not defined. Google OAuth will not work.');
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <Toaster 
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: 'var(--toast-bg)',
                                    color: 'var(--toast-text)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#10b981',
                                        secondary: '#fff',
                                    },
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: '#fff',
                                    },
                                },
                            }}
                        />
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route 
                                path="/" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Dashboard />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/trade" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Trade />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/orders" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <Orders />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/ai-advisor" 
                                element={
                                    <ProtectedRoute>
                                        <Layout>
                                            <AIAdvisor />
                                        </Layout>
                                    </ProtectedRoute>
                                } 
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}