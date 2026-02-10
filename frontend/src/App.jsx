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
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-dark-bg-primary">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="text-gray-600 dark:text-dark-text-muted">Loading...</p>
                </div>
            </div>
        );
    }
    return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary text-gray-900 dark:text-dark-text-primary font-sans transition-colors duration-200">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl pb-20 md:pb-8">
            {children}
        </main>
    </div>
);

export default function App() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                    <Toaster 
                        position="top-right"
                        toastOptions={{
                            className: 'dark:bg-dark-bg-secondary dark:text-dark-text-primary',
                            style: {
                                background: 'var(--toast-bg)',
                                color: 'var(--toast-text)',
                            }
                        }}
                    />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                        <Route path="/trade" element={<ProtectedRoute><Layout><Trade /></Layout></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
                        <Route path="/ai-advisor" element={<ProtectedRoute><Layout><AIAdvisor /></Layout></ProtectedRoute>} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}