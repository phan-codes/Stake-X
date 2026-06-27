import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import SEOHead from '../../components/SEOHead';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError('');

    try {
      // Use the custom edge function to generate a branded reset email
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'reset_password',
          to: email,
          data: { siteUrl: window.location.origin },
        },
      });

      if (error) {
        setError('An unexpected error occurred. Please try again later.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-2xl text-center">
          <div className="w-16 h-16 mx-auto bg-emerald-500/10 text-emerald-400 flex items-center justify-center rounded-full mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-white/60 mb-8 text-sm">
            We've sent a password reset link to <strong className="text-white">{email}</strong>. Click the link in the email to set a new password.
          </p>
          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="Reset Password"
        description="Reset your StakeX account password. Enter your email to receive a secure password reset link."
        path="/forgot-password"
        noIndex
      />
      <div className="glass-panel max-w-md w-full p-8 rounded-2xl">
        <div className="text-center mb-8">
          <TrendingUp size={48} className="mx-auto text-brand-500 mb-4" />
          <h2 className="text-3xl font-bold tracking-tight text-white">Forgot Password</h2>
          <p className="text-white/60 mt-2">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-white/40" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg bg-surface-950 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-surface-950 bg-brand-500 hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-surface-950 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-medium text-white/50 hover:text-white flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
