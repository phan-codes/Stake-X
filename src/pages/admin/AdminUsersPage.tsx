import { useEffect, useState } from 'react';
import { Search, Edit2, Plus, Minus, Loader2, X, Eye, EyeOff, Wallet, FileText, MessageSquare, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SEOHead from '../../components/SEOHead';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [connectedWallets, setConnectedWallets] = useState<Record<string, any[]>>({});
  const [userWallets, setUserWallets] = useState<Record<string, any[]>>({});

  // Password visibility
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Modals state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // Edit Balance
  const [showEditModal, setShowEditModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [savingBalance, setSavingBalance] = useState(false);

  // Edit Stats
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statField, setStatField] = useState('balance');
  const [statAmount, setStatAmount] = useState('');
  const [statType, setStatType] = useState<'add' | 'subtract'>('add');

  // Edit Wallet
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletCrypto, setWalletCrypto] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  // Tx Log
  const [showTxModal, setShowTxModal] = useState(false);
  const [txList, setTxList] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [newTxData, setNewTxData] = useState({ type: 'deposit', asset: 'USD', amount: '', status: 'completed' });

  // Send Message
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [messageStatus, setMessageStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      if (profiles) {
        setUsers(profiles);
        const userIds = profiles.map(p => p.id);
        
        const { data: balancesData } = await supabase
          .from('balances')
          .select('*')
          .in('user_id', userIds)
          .eq('asset', 'USD');

        if (balancesData) {
          const balanceMap: Record<string, number> = {};
          balancesData.forEach((b: any) => {
            balanceMap[b.user_id] = b.balance;
          });
          setBalances(balanceMap);
        }

        const { data: connectedData } = await supabase
          .from('connected_wallets')
          .select('*')
          .in('user_id', userIds);
          
        if (connectedData) {
          const cwMap: Record<string, any[]> = {};
          connectedData.forEach((cw: any) => {
            if (!cwMap[cw.user_id]) cwMap[cw.user_id] = [];
            cwMap[cw.user_id].push(cw);
          });
          setConnectedWallets(cwMap);
        }

        const { data: walletsData } = await supabase
          .from('wallets')
          .select('*')
          .in('user_id', userIds);

        if (walletsData) {
          const wMap: Record<string, any[]> = {};
          walletsData.forEach((w: any) => {
            if (!wMap[w.user_id]) wMap[w.user_id] = [];
            wMap[w.user_id].push(w);
          });
          setUserWallets(wMap);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBalanceUpdate = async () => {
    if (!selectedUser || !adjustmentAmount) return;
    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) return;

    setSavingBalance(true);
    try {
      const currentBalance = balances[selectedUser.id] || 0;
      const newBalance = adjustmentType === 'add' 
        ? currentBalance + amount 
        : Math.max(0, currentBalance - amount);

      await supabase.from('balances').upsert({
        user_id: selectedUser.id,
        asset: 'USD',
        balance: newBalance,
      }, { onConflict: 'user_id, asset' });

      setBalances(prev => ({ ...prev, [selectedUser.id]: newBalance }));
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating balance:', error);
    } finally {
      setSavingBalance(false);
    }
  };

  const saveStatUpdate = async () => {
    if (!selectedUser || !statAmount) return;
    const amount = parseFloat(statAmount);
    if (isNaN(amount)) return;

    if (statField === 'balance') {
      const current = balances[selectedUser.id] || 0;
      const newBalance = statType === 'add' ? current + amount : Math.max(0, current - amount);
      await supabase.from('balances').upsert({
        user_id: selectedUser.id,
        asset: 'USD',
        balance: newBalance,
      }, { onConflict: 'user_id, asset' });
      setBalances(prev => ({ ...prev, [selectedUser.id]: newBalance }));
    } else {
      const txType = statField === 'deposits' ? 'deposit' : statField === 'withdrawn' ? 'withdraw' : 'deposit'; // fallback to deposit for earned to pass schema check
      const adjAmount = statType === 'subtract' ? -amount : amount;
      
      if (adjAmount !== 0) {
        await supabase.from('transactions').insert({
          user_id: selectedUser.id,
          type: txType,
          asset: 'USD',
          amount: adjAmount,
          status: 'completed',
        });
      }
    }
    setShowStatsModal(false);
  };

  const saveWalletAddress = async () => {
    if (!selectedUser || !walletCrypto || !walletAddress) return;
    try {
      // @ts-ignore
      await supabase.from('wallets').insert({
        user_id: selectedUser.id,
        currency: walletCrypto,
        address: walletAddress,
      });
      setShowWalletModal(false);
    } catch (err) {
      console.error('Error saving wallet:', err);
    }
  };

  const handleOpenTxLog = async (user: any) => {
    setSelectedUser(user);
    setShowTxModal(true);
    setTxLoading(true);
    
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    setTxList(data || []);
    setTxLoading(false);
  };

  const addNewTx = async () => {
    if (!selectedUser || !newTxData.amount) return;
    try {
      const { data, error } = await supabase.from('transactions').insert({
        user_id: selectedUser.id,
        type: newTxData.type,
        asset: newTxData.asset,
        amount: parseFloat(newTxData.amount),
        status: newTxData.status,
      }).select().single();

      if (!error && data) {
        setTxList(prev => [data, ...prev]);
        setShowAddTx(false);
        setNewTxData({ type: 'deposit', asset: 'USD', amount: '', status: 'completed' });
      }
    } catch (err) {
      console.error('Error adding tx:', err);
    }
  };

  const deleteTx = async (txId: string) => {
    await supabase.from('transactions').delete().eq('id', txId);
    setTxList(prev => prev.filter(tx => tx.id !== txId));
  };

  const sendUserMessage = async () => {
    if (!selectedUser || !messageTitle || !messageContent) return;
    setIsSendingMsg(true);
    setMessageStatus(null);
    try {
      const { error } = await (supabase as any).from('notifications').insert({
        user_id: selectedUser.id,
        title: messageTitle.trim(),
        message: messageContent.trim(),
        sender_name: 'System Bot',
      });

      if (error) throw error;

      setMessageStatus({ type: 'success', text: 'Message sent successfully.' });
      setMessageTitle('');
      setMessageContent('');
      setTimeout(() => {
        setShowMessageModal(false);
      }, 900);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageStatus({ type: 'error', text: 'Failed to send message. Please try again.' });
    } finally {
      setIsSendingMsg(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <SEOHead title="Admin Users" description="Manage all registered users." path="/admin/users" noIndex />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">User Management</h1>
          <p className="text-white/60 mt-1">View and manage all registered traders.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search users..."
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
                  <th className="px-6 py-4 font-bold tracking-wider">User</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Password</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Balance</th>
                  <th className="px-6 py-4 font-bold tracking-wider">KYC Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Wallet Details</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Joined Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{user.full_name || 'N/A'}</span>
                        <span className="text-xs text-white/40">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.user_password ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-white/60">
                            {visiblePasswords[user.id] ? user.user_password : '••••••••'}
                          </span>
                          <button
                            className="p-1 text-white/40 hover:text-white transition-colors"
                            onClick={() => setVisiblePasswords(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                          >
                            {visiblePasswords[user.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/40 italic">Not stored</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">
                      ${(balances[user.id] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center w-fit ${
                        user.kyc_status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' :
                        user.kyc_status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        user.kyc_status === 'pending' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-white/5 text-white/50'
                      }`}>
                        {user.kyc_status || 'unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs max-w-[200px] whitespace-normal break-words">
                      {connectedWallets[user.id] && connectedWallets[user.id].map((cw: any, i: number) => (
                        <div key={`cw-${i}`} className="mb-2 p-2 bg-black/40 rounded-lg border border-white/5">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-bold text-white truncate" title={`App: ${cw.wallet_name}`}>
                              {cw.wallet_name}
                            </p>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                              cw.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                              cw.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                              cw.status === 'disconnected' ? 'bg-white/10 text-white/50' :
                              'bg-orange-500/10 text-orange-400'
                            }`}>
                              {cw.status || 'pending'}
                            </span>
                          </div>
                          <div className="text-white/60 font-mono text-[10px] truncate" title={cw.import_data}>
                            <span className="text-brand-400">[{cw.import_type}]</span> {cw.import_data}
                          </div>
                          {cw.password && (
                            <div className="text-white/60 font-mono text-[10px] truncate mt-0.5" title={cw.password}>
                              <span className="text-brand-400">Pass:</span> {cw.password}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {userWallets[user.id] && userWallets[user.id].map((wa: any, i: number) => (
                        <div key={`wa-${i}`} className="mb-1 p-1.5 bg-black/20 rounded border border-white/5">
                          <span className="text-white/40 text-[10px]">{wa.currency || 'Address'}: </span>
                          <span className="text-white/80 font-mono text-[10px] truncate">{wa.address}</span>
                        </div>
                      ))}
                      
                      {(!connectedWallets[user.id] || connectedWallets[user.id].length === 0) && 
                       (!userWallets[user.id] || userWallets[user.id].length === 0) && (
                        <span className="text-white/40 italic">No wallets connected</span>
                      )}
                    </td>
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedUser(user); setAdjustmentAmount(''); setAdjustmentType('add'); setShowEditModal(true); }}
                          className="p-2 text-white/60 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                          title="Edit Balance"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => { setSelectedUser(user); setStatAmount(''); setStatType('add'); setShowStatsModal(true); }}
                          className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="Edit Stats"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => { setSelectedUser(user); setWalletCrypto(''); setWalletAddress(''); setShowWalletModal(true); }}
                          className="p-2 text-white/60 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors"
                          title="Edit Wallet Address"
                        >
                          <Wallet size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenTxLog(user)}
                          className="p-2 text-white/60 hover:text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors"
                          title="Transaction Log"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setMessageTitle('');
                            setMessageContent('');
                            setMessageStatus(null);
                            setShowMessageModal(true);
                          }}
                          className="p-2 text-white/60 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-colors"
                          title="Send Message"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-white/40">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reusable Modal Backdrop */}
      {(showEditModal || showStatsModal || showWalletModal || showTxModal || showMessageModal) && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          
          {/* Edit Balance Modal */}
          {showEditModal && (
            <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">Update Balance</h3>
                  <p className="text-xs text-white/60">{selectedUser.email}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-white/60 hover:text-white p-1"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <button onClick={() => setAdjustmentType('add')} className={`flex-1 flex justify-center gap-2 py-2 rounded-xl text-sm font-bold ${adjustmentType === 'add' ? 'bg-emerald-500 text-white' : 'bg-surface-800 text-white/60'}`}><Plus size={16} /> Add</button>
                  <button onClick={() => setAdjustmentType('subtract')} className={`flex-1 flex justify-center gap-2 py-2 rounded-xl text-sm font-bold ${adjustmentType === 'subtract' ? 'bg-red-500 text-white' : 'bg-surface-800 text-white/60'}`}><Minus size={16} /> Subtract</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Amount (USD)</label>
                  <input type="number" step="0.01" min="0" placeholder="0.00" value={adjustmentAmount} onChange={(e) => setAdjustmentAmount(e.target.value)} className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white focus:border-brand-500 outline-none" />
                </div>
              </div>
              <div className="p-4 bg-surface-800/50 border-t border-white/10 flex justify-end gap-3">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancel</button>
                <button onClick={saveBalanceUpdate} disabled={savingBalance || !adjustmentAmount} className="px-6 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 flex gap-2 items-center">{savingBalance && <Loader2 size={16} className="animate-spin"/>} Save</button>
              </div>
            </div>
          )}

          {/* Edit Stats Modal */}
          {showStatsModal && (
            <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Edit Dashboard Stats</h3>
                <button onClick={() => setShowStatsModal(false)} className="text-white/60 hover:text-white p-1"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Stat to Edit</label>
                  <select value={statField} onChange={(e) => setStatField(e.target.value)} className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white focus:border-brand-500 outline-none">
                    <option value="balance">Account Balance</option>
                    <option value="deposits">Total Deposits</option>
                    <option value="withdrawn">Total Withdrawn</option>
                    <option value="earned">Total Earned</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setStatType('add')} className={`flex-1 flex justify-center gap-2 py-2 rounded-xl text-sm font-bold ${statType === 'add' ? 'bg-emerald-500 text-white' : 'bg-surface-800 text-white/60'}`}><Plus size={16} /> Add</button>
                  <button onClick={() => setStatType('subtract')} className={`flex-1 flex justify-center gap-2 py-2 rounded-xl text-sm font-bold ${statType === 'subtract' ? 'bg-red-500 text-white' : 'bg-surface-800 text-white/60'}`}><Minus size={16} /> Subtract</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Amount (USD)</label>
                  <input type="number" step="0.01" min="0" placeholder="0.00" value={statAmount} onChange={(e) => setStatAmount(e.target.value)} className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white focus:border-brand-500 outline-none" />
                </div>
              </div>
              <div className="p-4 bg-surface-800/50 border-t border-white/10 flex justify-end gap-3">
                <button onClick={() => setShowStatsModal(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancel</button>
                <button onClick={saveStatUpdate} disabled={!statAmount} className="px-6 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50">Save</button>
              </div>
            </div>
          )}

          {/* Wallet Address Modal */}
          {showWalletModal && (
            <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Add Wallet Address</h3>
                <button onClick={() => setShowWalletModal(false)} className="text-white/60 hover:text-white p-1"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Crypto Name</label>
                  <input type="text" placeholder="e.g. Bitcoin, USDT" value={walletCrypto} onChange={(e) => setWalletCrypto(e.target.value)} className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Wallet Address</label>
                  <input type="text" placeholder="Enter address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white outline-none" />
                </div>
              </div>
              <div className="p-4 bg-surface-800/50 border-t border-white/10 flex justify-end gap-3">
                <button onClick={() => setShowWalletModal(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancel</button>
                <button onClick={saveWalletAddress} disabled={!walletAddress} className="px-6 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50">Save</button>
              </div>
            </div>
          )}

          {/* Transaction Log Modal */}
          {showTxModal && (
            <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-white">Transaction Log</h3>
                <button onClick={() => setShowTxModal(false)} className="text-white/60 hover:text-white p-1"><X size={20}/></button>
              </div>
              <div className="p-4 border-b border-white/5 shrink-0">
                <button onClick={() => setShowAddTx(!showAddTx)} className="flex items-center gap-2 text-sm font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-white transition-colors">
                  <Plus size={16}/> Add Transaction
                </button>
                {showAddTx && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                    <select value={newTxData.type} onChange={e => setNewTxData({...newTxData, type: e.target.value})} className="bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                      <option value="deposit">Deposit</option>
                      <option value="withdraw">Withdraw</option>
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>
                    <input type="text" placeholder="Asset" value={newTxData.asset} onChange={e => setNewTxData({...newTxData, asset: e.target.value})} className="bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"/>
                    <input type="number" placeholder="Amount" value={newTxData.amount} onChange={e => setNewTxData({...newTxData, amount: e.target.value})} className="bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"/>
                    <select value={newTxData.status} onChange={e => setNewTxData({...newTxData, status: e.target.value})} className="bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                    <button onClick={addNewTx} className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 rounded-lg text-sm">Save</button>
                  </div>
                )}
              </div>
              <div className="overflow-y-auto p-4 space-y-2 flex-1">
                {txLoading ? <Loader2 className="animate-spin mx-auto text-brand-500" /> : txList.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-surface-800 rounded-lg border border-white/5">
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="font-bold text-sm uppercase text-white">{tx.type}</span>
                        <span className="text-white/60 text-xs">${tx.amount} {tx.asset}</span>
                      </div>
                      <span className="text-[10px] text-white/40">{new Date(tx.created_at).toLocaleString()} - {tx.status}</span>
                    </div>
                    <button onClick={() => deleteTx(tx.id)} className="text-red-400 hover:bg-red-400/10 p-2 rounded-md"><Trash2 size={16}/></button>
                  </div>
                ))}
                {!txLoading && txList.length === 0 && <p className="text-center text-white/40 text-sm">No transactions found.</p>}
              </div>
            </div>
          )}

          {/* Send Message Modal */}
          {showMessageModal && (
            <div className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Send Message</h3>
                <button onClick={() => setShowMessageModal(false)} className="text-white/60 hover:text-white p-1"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Subject</label>
                  <input type="text" placeholder="Message subject" value={messageTitle} onChange={(e) => setMessageTitle(e.target.value)} className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Message Body</label>
                  <textarea rows={4} placeholder="Write your message..." value={messageContent} onChange={(e) => setMessageContent(e.target.value)} className="w-full px-4 py-3 bg-surface-800 border border-white/10 rounded-xl text-white outline-none resize-none" />
                </div>
                {messageStatus && (
                  <p className={`text-sm ${messageStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {messageStatus.text}
                  </p>
                )}
              </div>
              <div className="p-4 bg-surface-800/50 border-t border-white/10 flex justify-end gap-3">
                <button onClick={() => setShowMessageModal(false)} className="px-4 py-2 text-sm text-white/60 hover:text-white">Cancel</button>
                <button onClick={sendUserMessage} disabled={!messageTitle || !messageContent || isSendingMsg} className="px-6 py-2 rounded-xl text-sm font-bold bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 flex gap-2 items-center">{isSendingMsg && <Loader2 size={16} className="animate-spin"/>} Send Message</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
