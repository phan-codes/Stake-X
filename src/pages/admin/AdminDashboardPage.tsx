import { useEffect, useState } from 'react';
import { Users, Wallet, CloudDownload, TrendingUp, ShieldCheck, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SEOHead from '../../components/SEOHead';

interface DashboardStats {
  totalUsers: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  activeInvestments: number;
  pendingInvestments: number;
  pendingKyc: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    activeInvestments: 0,
    pendingInvestments: 0,
    pendingKyc: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          { count: userCount },
          { count: depositCount },
          { count: withdrawCount },
          { count: investmentCount },
          { count: pendingInvestmentCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'deposit').eq('status', 'pending'),
          supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'withdraw').eq('status', 'pending'),
          supabase.from('user_investments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('type', 'investment').eq('status', 'pending'),
        ]);

        // Fetch KYC count separately since it might throw an error if column doesn't exist
        let kycCount = 0;
        try {
          const { count } = await (supabase as any)
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('kyc_status', 'pending');
          kycCount = count || 0;
        } catch (e) {
          console.log('KYC status not available');
        }

        setStats({
          totalUsers: userCount || 0,
          pendingDeposits: depositCount || 0,
          pendingWithdrawals: withdrawCount || 0,
          activeInvestments: investmentCount || 0,
          pendingInvestments: pendingInvestmentCount || 0,
          pendingKyc: kycCount,
        });

        const { data: users } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (users) {
          setRecentUsers(users);
        }
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Pending Stakes', value: stats.pendingDeposits, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Pending Unstakes', value: stats.pendingWithdrawals, icon: CloudDownload, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: 'Active Pools', value: stats.activeInvestments, icon: TrendingUp, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { title: 'Pending Pools', value: stats.pendingInvestments, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Pending KYC', value: stats.pendingKyc, icon: ShieldCheck, color: 'text-brand-400', bg: 'bg-brand-400/10' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SEOHead title="Admin Dashboard" description="Admin overview and platform statistics." path="/admin" noIndex />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">Protocol Admin</h1>
        <p className="text-white/60 mt-1 text-sm sm:text-base">Protocol statistics and recent activity.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <div key={stat.title} className="p-6 rounded-2xl bg-surface-900 border border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs sm:text-sm font-medium text-white/60 mb-1">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 bg-surface-900 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <UserPlus size={18} className="text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Recent Signups</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs uppercase bg-black/20 text-white/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Name</th>
                <th className="px-6 py-4 font-bold tracking-wider">Email</th>
                <th className="px-6 py-4 font-bold tracking-wider">Joined</th>
                <th className="px-6 py-4 font-bold tracking-wider">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{user.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-white/60">{user.email}</td>
                  <td className="px-6 py-4 text-white/60">
                    {new Date(user.created_at).toLocaleString(undefined, { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </td>
                  <td className="px-6 py-4 text-white/60">
                    {(user as any).last_login ? new Date((user as any).last_login).toLocaleString() : "Never"}
                  </td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-white/40">
                    No recent signups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
