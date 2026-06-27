import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { sendEmailNotification } from '../../lib/email';
import { TrendingUp, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import SEOHead from '../../components/SEOHead';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const fullName = formData.get('fullName') as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const metadata: Record<string, string> = {
      full_name: fullName,
    };


    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      }
    });
    
    if (error) {
      setError(error.message);
    } else {
      // Send new user notification to admin
      sendEmailNotification({
        to: 'admin',
        type: 'new_user_admin',
        data: { email, name: fullName },
      });
      
      navigate('/dashboard');
    }
    setLoading(false);
  };



  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="Create Account"
        description="Create your StakeX account and start your crypto staking journey. Secure registration with decentralized yield access."
        path="/register"
      />
      <div className="glass-panel max-w-md w-full p-8 rounded-2xl">
        <div className="text-center mb-8">
          <TrendingUp size={48} className="mx-auto text-brand-500 mb-4" />
          <h2 className="text-3xl font-bold tracking-tight text-white">Create an account</h2>
          <p className="text-white/60 mt-2">Start your staking journey</p>
        </div>


        <form className="space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-white/40" />
              </div>
              <input
                name="fullName"
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg bg-surface-950 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-white/40" />
              </div>
              <input
                name="email"
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg bg-surface-950 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-white/40" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-lg bg-surface-950 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-white/40" />
              </div>
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-lg bg-surface-950 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-surface-950 bg-brand-500 hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-surface-950 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Register'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-white/50">
          Already have an account? <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
