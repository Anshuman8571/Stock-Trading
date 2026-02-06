import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <--- Import this
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Orders from './pages/Orders';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
        </main>
    </div>
);

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="top-right" /> {/* <--- Add Toaster here */}
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                    <Route path="/trade" element={<ProtectedRoute><Layout><Trade /></Layout></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}