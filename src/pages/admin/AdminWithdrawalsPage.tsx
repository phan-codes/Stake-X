import { useEffect, useState } from 'react';
import { Check, X, Loader2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { sendEmailNotification } from '../../lib/email';
import SEOHead from '../../components/SEOHead';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (full_name, email, wallet_address)
        `)
        .eq('type', 'withdraw')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setWithdrawals(data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (transaction: any, newStatus: 'completed' | 'failed') => {
    try {
      setProcessingId(transaction.id);

      // If completing the withdrawal, deduct balance first
      if (newStatus === 'completed') {
        const { data: balanceData } = await supabase
          .from('balances')
          .select('balance')
          .eq('user_id', transaction.user_id)
          .eq('asset', 'USD')
          .single();

        const currentBalance = balanceData?.balance || 0;
        
        // Ensure balance doesn't go below zero
        const newBalance = Math.max(0, currentBalance - transaction.amount);
        
        const { error: balanceError } = await supabase
          .from('balances')
          .upsert({
            user_id: transaction.user_id,
            asset: 'USD',
            balance: newBalance,
          }, { onConflict: 'user_id, asset' });

        if (balanceError) throw balanceError;
      }

      // Update transaction status
      const { error: txError } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', transaction.id);

      if (txError) throw txError;

      // Update local state
      setWithdrawals(prev => prev.map(w => 
        w.id === transaction.id ? { ...w, status: newStatus } : w
      ));

      // Send email to user (fire-and-forget)
      if (newStatus === 'completed' && transaction.profiles?.email) {
        sendEmailNotification({
          to: transaction.profiles.email,
          type: 'withdrawal_approved',
          data: { amount: transaction.amount },
        });
      }

    } catch (error) {
      console.error(`Error updating withdrawal status to ${newStatus}:`, error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    w.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SEOHead title="Admin Unstakes" description="Review and process user unstakes." path="/admin/withdrawals" noIndex />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Unstake Requests</h1>
          <p className="text-white/60 mt-1">Review and process user unstakes.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search unstakes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-900 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-surface-900 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs uppercase bg-black/20 text-white/40 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Transaction ID</th>
                  <th className="px-6 py-4 font-bold tracking-wider">User</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Wallet Address</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Amount</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-white/60">
                      {w.id.split('-')[0]}...
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{w.profiles?.full_name || 'N/A'}</span>
                        <span className="text-xs text-white/40">{w.profiles?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {w.profiles?.wallet_address ? (
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-white truncate max-w-[150px]" title={w.profiles.wallet_address}>
                            {w.profiles.wallet_address}
                          </span>
                          <span className="text-[10px] text-white/40">{w.asset}</span>
                        </div>
                      ) : (
                        <span className="text-white/40 italic">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      ${w.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                        w.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        w.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                        'bg-orange-500/10 text-orange-400'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {new Date(w.created_at).toLocaleString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {w.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          {processingId === w.id ? (
                            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                          ) : (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(w, 'completed')}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                                title="Approve & Deduct"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(w, 'failed')}
                                className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-white/40 italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredWithdrawals.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-white/40">
                      No withdrawals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
