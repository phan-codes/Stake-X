import { useEffect, useState } from 'react';
import { Check, X, Loader2, Search, Eye, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { sendEmailNotification } from '../../lib/email';
import SEOHead from '../../components/SEOHead';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename + '.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      window.open(url, '_blank');
    }
  };

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setDeposits(data);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (transaction: any, newStatus: 'completed' | 'failed') => {
    try {
      setProcessingId(transaction.id);

      // If completing the deposit, update balance first
      if (newStatus === 'completed') {
        const { error: balanceError } = await (supabase as any).rpc('update_balance_atomic', {
          p_user_id: transaction.user_id,
          p_asset: 'USD',
          p_amount: transaction.amount
        });

        if (balanceError) throw balanceError;
      }

      // Update transaction status
      const { error: txError } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', transaction.id);

      if (txError) throw txError;

      // Update local state
      setDeposits(prev => prev.map(dep => 
        dep.id === transaction.id ? { ...dep, status: newStatus } : dep
      ));

      // Send email to user (fire-and-forget)
      if (newStatus === 'completed' && transaction.profiles?.email) {
        sendEmailNotification({
          to: transaction.profiles.email,
          type: 'deposit_approved',
          data: { amount: transaction.amount },
        });
      }

    } catch (error) {
      console.error(`Error updating deposit status to ${newStatus}:`, error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredDeposits = deposits.filter(dep => 
    dep.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    dep.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dep.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SEOHead title="Admin Stakes" description="Review and manage user stakes." path="/admin/deposits" noIndex />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Stake Requests</h1>
          <p className="text-white/60 mt-1">Review and manage user stakes.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search stakes..."
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
                  <th className="px-6 py-4 font-bold tracking-wider">Amount</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Receipt</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-white/60">
                      {dep.id.split('-')[0]}...
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{dep.profiles?.full_name || 'N/A'}</span>
                        <span className="text-xs text-white/40">{dep.profiles?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      ${dep.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {dep.asset}
                    </td>
                    <td className="px-6 py-4">
                      {dep.receipt_image ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setReceiptPreview(dep.receipt_image)}
                            className="p-1.5 text-brand-400 hover:bg-brand-400/10 rounded-lg transition-colors"
                            title="View Receipt"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => downloadImage(dep.receipt_image, `receipt_${dep.profiles?.full_name || 'user'}_${dep.id.split('-')[0]}`)}
                            className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                            title="Download Receipt"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-white/40 italic text-xs">None</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                        dep.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        dep.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                        'bg-orange-500/10 text-orange-400'
                      }`}>
                        {dep.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {new Date(dep.created_at).toLocaleString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {dep.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          {processingId === dep.id ? (
                            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                          ) : (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(dep, 'completed')}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(dep, 'failed')}
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
                {filteredDeposits.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-white/40">
                      No deposits found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Preview Modal */}
      {receiptPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setReceiptPreview(null)}>
          <div className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/5 bg-surface-900/60 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Deposit Receipt</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(receiptPreview, 'deposit_receipt');
                  }} 
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Download size={16} /> Download
                </button>
                <button onClick={() => setReceiptPreview(null)} className="text-white/60 hover:text-white p-1">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 flex items-center justify-center bg-black/30 max-h-[70vh] overflow-auto">
              <img src={receiptPreview} alt="Receipt" className="max-w-full object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
