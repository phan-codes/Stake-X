import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  // If there's no Supabase URL yet (local UI preview), let them pass
  if (!user && import.meta.env.VITE_SUPABASE_URL) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
