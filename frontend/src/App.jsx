import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Adding explicit .jsx extensions to resolve build environment pathing issues
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Trade from './pages/Trade.jsx';
import Orders from './pages/Orders.jsx';
import AIAdvisor from './pages/AIAdvisor.jsx';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium tracking-wide">AUTHENTICATING...</p>
                </div>
            </div>
        );
    }
    
    return user ? children : <Navigate to="/login" replace />;
};

const Layout = ({ children }) => (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-slate-900 dark:text-white font-sans transition-colors duration-200">
        <Navbar />
        <main className="w-full pb-24 md:pb-8">
            {children}
        </main>
    </div>
);

export default function App() {
    // Handling potential environment variable access warnings
    const googleClientId = typeof import.meta !== 'undefined' && import.meta.env 
        ? import.meta.env.VITE_GOOGLE_CLIENT_ID 
        : '';

    return (
        <GoogleOAuthProvider clientId={googleClientId || 'fallback-id'}>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <Toaster 
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#ffffff',
                                    color: '#0f172a',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
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