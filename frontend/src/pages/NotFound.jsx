import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 text-center p-4">
            <h1 className="text-9xl font-extrabold text-emerald-200">404</h1>
            <h2 className="text-2xl font-bold text-emerald-900 mt-4">Page Not Found</h2>
            <p className="text-emerald-600 mt-2 mb-8">The page you are looking for doesn't exist or has been moved.</p>
            <Link to="/" className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">
                <Home size={20} /> Back to Dashboard
            </Link>
        </div>
    );
}