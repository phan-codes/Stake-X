import { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Layers,
  LogOut,
  Menu,
  X,
  ArrowUpFromLine,
  Coins,
  History,
  UserCircle,
  Bell,
  ChevronRight,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/common/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useDashboardData } from '../hooks/useDashboardData';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Stake Assets', href: '/dashboard/deposit', icon: Wallet },
  { name: 'Staking Pools', href: '/dashboard/investments', icon: Layers },
  { name: 'Borrow', href: '/dashboard/loan', icon: Coins },
  { name: 'Unstake', href: '/dashboard/withdraw', icon: ArrowUpFromLine },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
  { name: 'Profile Settings', href: '/dashboard/profile', icon: UserCircle },
];

export default function DashboardLayout() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pageContentRef = useRef<HTMLDivElement>(null);
  const { pendingInvestments, pendingDeposits, pendingWithdrawals } = useDashboardData();

  useEffect(() => {
    pageContentRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      const { count } = await (supabase as any)
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (count !== null) setUnreadCount(count);
    };

    fetchUnreadCount();

    const channel = supabase
      .channel('dashboard_notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        fetchUnreadCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  // Badge count map for sidebar items
  const getBadgeCount = (name: string): number => {
    switch (name) {
      case 'Inbox': return unreadCount;
      case 'Staking Pools': return pendingInvestments;
      case 'Stake Assets': return pendingDeposits;
      case 'Unstake': return pendingWithdrawals;
      default: return 0;
    }
  };

  const totalPendingCount = unreadCount + pendingInvestments + pendingDeposits + pendingWithdrawals;

  const SidebarNav = ({ onClose }: { onClose?: () => void }) => (
    <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
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
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center ${
                item.name === 'Inbox' 
                  ? 'bg-brand-500 text-surface-900' 
                  : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
              }`}>
                {badgeCount}
              </span>
            ) : active ? (
              <ChevronRight
                size={14}
                className="text-brand-400/60"
              />
            ) : null}
          </Link>
        );
      })}
      
      {isAdmin && (
        <div className="pt-4 mt-4 border-t border-white/5">
          <Link
            to="/admin"
            onClick={onClose}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative text-brand-400 hover:bg-brand-500/10 border border-brand-500/20"
          >
            <ShieldCheck size={18} className="shrink-0 transition-colors text-brand-400" />
            <span className="font-medium text-sm">Admin Panel</span>
          </Link>
        </div>
      )}
    </nav>
  );

  const SidebarFooter = ({ onClose }: { onClose?: () => void }) => {
    const userFullName = user?.user_metadata?.full_name || 'My Account';
    const userInitial = userFullName.charAt(0).toUpperCase();

    return (
    <div className="p-4 border-t border-white/5 shrink-0 space-y-2">
      <Link
        to="/dashboard/profile"
        onClick={onClose}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-200"
      >
        <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">
          {userInitial}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-semibold text-white truncate">{userFullName}</span>
          <span className="text-xs text-white/40 truncate">View Profile</span>
        </div>
      </Link>
      <button
        onClick={() => { onClose?.(); handleLogout(); }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-transparent transition-all duration-200"
      >
        <LogOut size={18} className="shrink-0" />
        <span className="font-medium text-sm">Logout</span>
      </button>
    </div>
  )};

  const SidebarHeader = ({ onClose }: { onClose?: () => void }) => (
    <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
      <Logo to="/" />
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
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/dashboard/inbox" className="relative p-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-brand-500 text-surface-900 text-[10px] font-bold rounded-full px-1 animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            {totalPendingCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">{totalPendingCount} Pending</span>
              </div>
            )}
            <Link
              to="/dashboard/profile"
              className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm hover:bg-brand-500/30 transition-colors"
            >
              {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div ref={pageContentRef} className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

