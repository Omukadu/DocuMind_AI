import { Link } from 'react-router-dom';
import { Brain, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft size={15} /> Go back
          </button>
          <Link to="/dashboard" className="btn-primary">
            <Home size={15} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
