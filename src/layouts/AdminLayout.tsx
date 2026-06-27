import { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Layers,
  LogOut,
  Users,
  Menu,
  X,
  ArrowUpFromLine,
  ShieldCheck,
  KeyRound,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  { name: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Manage Users', href: '/admin/users', icon: Users },
  { name: 'Wallets', href: '/admin/wallets', icon: KeyRound },
  { name: 'Stake Requests', href: '/admin/deposits', icon: Wallet },
  { name: 'Staking Pools', href: '/admin/investments', icon: Layers },
  { name: 'Unstake Requests', href: '/admin/withdrawals', icon: ArrowUpFromLine },
  { name: 'KYC Requests', href: '/admin/kyc', icon: ShieldCheck },
];

interface PendingCounts {
  deposits: number;
  investments: number;
  withdrawals: number;
  kyc: number;
}

export default function AdminLayout() {
  const { signOut, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pageContentRef = useRef<HTMLDivElement>(null);
  const [pendingCounts, setPendingCounts] = useState<PendingCounts>({ deposits: 0, investments: 0, withdrawals: 0, kyc: 0 });

  useEffect(() => {
    pageContentRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchPendingCounts = async () => {
      try {
        const [
          { count: depositCount },
          { count: investmentCount },
          { count: withdrawCount },
        ] = await Promise.all([
          supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'deposit').eq('status', 'pending'),
          supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'investment').eq('status', 'pending'),
          supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'withdraw').eq('status', 'pending'),
        ]);

        let kycCount = 0;
        try {
          const { count } = await (supabase as any)
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('kyc_status', 'pending');
          kycCount = count || 0;
        } catch {
          // kyc_status column may not exist
        }

        setPendingCounts({
          deposits: depositCount || 0,
          investments: investmentCount || 0,
          withdrawals: withdrawCount || 0,
          kyc: kycCount,
        });
      } catch (e) {
        console.error('Error fetching pending counts:', e);
      }
    };

    fetchPendingCounts();

    // Realtime subscription for pending counts
    const channel = supabase
      .channel('admin_pending_counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchPendingCounts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchPendingCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    signOut().then(() => {
      navigate('/');
    });
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const getPageTitle = () => {
    const match = navigation.find((n) => isActive(n.href));
    return match?.name ?? 'Admin Panel';
  };

  // Badge count map for admin sidebar items
  const getBadgeCount = (name: string): number => {
    switch (name) {
      case 'Stake Requests': return pendingCounts.deposits;
      case 'Staking Pools': return pendingCounts.investments;
      case 'Unstake Requests': return pendingCounts.withdrawals;
      case 'KYC Requests': return pendingCounts.kyc;
      default: return 0;
    }
  };

  const totalPending = pendingCounts.deposits + pendingCounts.investments + pendingCounts.withdrawals + pendingCounts.kyc;

  const SidebarNav = ({ onClose }: { onClose?: () => void }) => (
    <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
      {navigation.map((item) => {
        const active = isActive(item.href);
        const badgeCount = getBadgeCount(item.name);
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
              active
                ? 'text-brand-400 bg-brand-500/10 border border-brand-500/20'
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon
                size={18}
                className={`shrink-0 transition-colors ${
                  active ? 'text-brand-400' : 'text-white/50 group-hover:text-white'
                }`}
              />
              <span className="font-medium text-sm">{item.name}</span>
            </div>
            {badgeCount > 0 ? (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center bg-brand-500/20 text-brand-400 border border-brand-500/30 animate-pulse">
                {badgeCount}
              </span>
            ) : active ? (
              <ChevronRight
                size={14}
                className="ml-auto text-brand-400/60"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarFooter = ({ onClose }: { onClose?: () => void }) => (
    <div className="p-4 border-t border-white/5 shrink-0 space-y-2">
      <Link
        to="/dashboard"
        onClick={onClose}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-200"
      >
        <ArrowLeft size={18} className="shrink-0" />
        <span className="font-medium text-sm">User Dashboard</span>
      </Link>
      <button
        onClick={() => { onClose?.(); handleLogout(); }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-transparent transition-all duration-200"
      >
        <LogOut size={18} className="shrink-0" />
        <span className="font-medium text-sm">Logout</span>
      </button>
    </div>
  );

  const SidebarHeader = ({ onClose }: { onClose?: () => void }) => (
    <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-brand-500" />
        <span className="text-lg font-bold text-white tracking-tight">Admin Panel</span>
      </div>
      {onClose && (
        <button
          className="md:hidden text-white/50 hover:text-white transition-colors p-1"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-950 flex overflow-hidden">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed inset-y-0 left-0 w-64 border-r border-white/5 bg-surface-900 z-50 flex flex-col md:hidden"
            >
              <SidebarHeader onClose={() => setIsMobileMenuOpen(false)} />
              <SidebarNav onClose={() => setIsMobileMenuOpen(false)} />
              <SidebarFooter onClose={() => setIsMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-surface-900/60 backdrop-blur-md hidden md:flex flex-col shrink-0">
        <SidebarHeader />
        <SidebarNav />
        <SidebarFooter />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="relative z-50 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-surface-900/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-white/70 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-semibold font-heading text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-brand-400" />
                {getPageTitle()}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalPending > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400" />
                </span>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">{totalPending} Pending</span>
              </div>
            )}
            <div className="relative p-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer">
              <Bell size={18} />
              {totalPending > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                  {totalPending > 99 ? '99+' : totalPending}
                </span>
              )}
            </div>
            <Link
              to="/dashboard/profile"
              className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm hover:bg-brand-500/30 transition-colors"
            >
              A
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div ref={pageContentRef} className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

