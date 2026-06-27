import { useEffect, useState } from 'react';
import { Ban, Loader2, Search, Check, X, AlertTriangle, Plus, Edit2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { sendEmailNotification } from '../../lib/email';
import SEOHead from '../../components/SEOHead';

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [historyTransactions, setHistoryTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<any | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    user_id: '',
    plan_id: '',
    amount: '',
    status: 'active',
    start_date: '',
    end_date: ''
  });

  const [historyFormData, setHistoryFormData] = useState({
    user_id: '',
    plan_name: '',
    amount: '',
    status: 'completed',
    created_at: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [invRes, reqRes, usersRes, plansRes] = await Promise.all([
        (supabase as any)
          .from('user_investments')
          .select(`*, profiles:user_id (full_name, email), investment_plans:plan_id (name, return_rate_percentage)`)
          .order('start_date', { ascending: false }),
        supabase
          .from('transactions')
          .select(`*, profiles:user_id (full_name, email)`)
          .eq('type', 'investment')
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, email').order('full_name'),
        (supabase as any).from('investment_plans').select('*').order('name')
      ]);

      if (invRes.error) throw invRes.error;
      if (reqRes.error) throw reqRes.error;
      if (usersRes.error) throw usersRes.error;
      if (plansRes.error) throw plansRes.error;

      setInvestments(invRes.data || []);
      const allReqs = reqRes.data || [];
      setPendingRequests(allReqs.filter((r: any) => r.status === 'pending'));
      setHistoryTransactions(allReqs.filter((r: any) => r.status !== 'pending'));
      setUsers(usersRes.data || []);
      setPlans(plansRes.data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvestment = async (investment: any) => {
    if (!confirm('Are you sure you want to cancel this investment? This will refund the user.')) return;
    
    try {
      setProcessingId(investment.id);

      // Refund the user's balance
      const { data: balanceData } = await supabase
        .from('balances')
        .select('balance')
        .eq('user_id', investment.user_id)
        .eq('asset', 'USD')
        .single();

      const currentBalance = balanceData?.balance || 0;
      
      const { error: balanceError } = await supabase
        .from('balances')
        .upsert({
          user_id: investment.user_id,
          asset: 'USD',
          balance: currentBalance + Number(investment.amount),
        }, { onConflict: 'user_id, asset' });

      if (balanceError) throw balanceError;

      // Update investment status
      const { error: invError } = await (supabase as any)
        .from('user_investments')
        .update({ status: 'cancelled' })
        .eq('id', investment.id);

      if (invError) throw invError;

      // Update local state
      setInvestments(prev => prev.map(inv => 
        inv.id === investment.id ? { ...inv, status: 'cancelled' } : inv
      ));
      setSuccessMessage("Investment cancelled and refunded successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error cancelling investment:', error);
      setErrorMessage("Failed to cancel investment.");
    } finally {
      setProcessingId(null);
    }
  };

  const PLAN_DEFAULTS: Record<string, { duration_days: number; return_rate_percentage: number; min_amount: number }> = {
    'Starter Plan': { duration_days: 1, return_rate_percentage: 10, min_amount: 1000 },
    'Premium Plan': { duration_days: 2, return_rate_percentage: 22, min_amount: 10000 },
    'Gold Plan':    { duration_days: 3, return_rate_percentage: 35, min_amount: 50000 },
  };

  const handleApproveRequest = async (request: any) => {
    try {
      setErrorMessage(null);
      setProcessingId(request.id);

      const { data: planRows } = await (supabase as any)
        .from('investment_plans')
        .select('*')
        .eq('name', request.plan_name)
        .limit(1);
      
      let planData = planRows?.[0] || null;

      if (!planData) {
        const defaults = PLAN_DEFAULTS[request.plan_name];
        if (!defaults) throw new Error(`Unknown investment plan: "${request.plan_name}". Cannot auto-create.`);

        const { data: newPlan, error: createError } = await (supabase as any)
          .from('investment_plans')
          .insert({
            name: request.plan_name,
            duration_days: defaults.duration_days,
            return_rate_percentage: defaults.return_rate_percentage,
            min_amount: defaults.min_amount,
          })
          .select()
          .single();

        if (createError || !newPlan) throw new Error("Failed to create investment plan.");
        planData = newPlan;
      }

      const { data: balanceData } = await supabase
        .from('balances')
        .select('balance')
        .eq('user_id', request.user_id)
        .eq('asset', 'USD')
        .single();

      const currentBalance = balanceData?.balance || 0;
      if (currentBalance < request.amount) {
         throw new Error("User has insufficient USD balance to approve this investment.");
      }

      const { error: balanceError } = await supabase
        .from('balances')
        .upsert({
          user_id: request.user_id,
          asset: 'USD',
          balance: currentBalance - request.amount,
        }, { onConflict: 'user_id, asset' });

      if (balanceError) throw balanceError;

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (planData.duration_days || 1));

      const { error: invError } = await (supabase as any)
        .from('user_investments')
        .insert({
          user_id: request.user_id,
          plan_id: planData.id,
          amount: request.amount,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      if (invError) throw invError;

      const { error: txError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', request.id);

      if (txError) throw txError;

      sendEmailNotification({
        to: request.profiles?.email,
        type: 'investment_approved',
        data: {
          email: request.profiles?.email,
          full_name: request.profiles?.full_name,
          plan_name: request.plan_name,
          amount: request.amount,
        },
      });

      fetchData();
      setSuccessMessage("Pool request approved.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error("Error approving request:", error);
      setErrorMessage(error.message || "Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (request: any) => {
    if (!confirm('Are you sure you want to reject this pool request?')) return;
    try {
      setErrorMessage(null);
      setProcessingId(request.id);
      const { error: txError } = await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', request.id);

      if (txError) throw txError;
      fetchData();
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveInvestment = async () => {
    try {
      setProcessingId('saving');
      setErrorMessage(null);

      if (!formData.user_id || !formData.plan_id || !formData.amount || !formData.start_date || !formData.end_date) {
        throw new Error("Please fill in all fields.");
      }

      const payload = {
        user_id: formData.user_id,
        plan_id: formData.plan_id,
        amount: Number(formData.amount),
        status: formData.status,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      };

      if (editingInvestment) {
        const { error } = await (supabase as any)
          .from('user_investments')
          .update(payload)
          .eq('id', editingInvestment.id);
        if (error) throw error;
        setSuccessMessage("Investment updated successfully.");
      } else {
        const { error } = await (supabase as any)
          .from('user_investments')
          .insert(payload);
        if (error) throw error;
        setSuccessMessage("Investment added successfully.");
      }

      setTimeout(() => setSuccessMessage(null), 3000);
      setIsAddModalOpen(false);
      setEditingInvestment(null);
      fetchData();
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to save investment");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveHistory = async () => {
    try {
      setProcessingId('saving_history');
      setErrorMessage(null);

      if (!historyFormData.user_id || !historyFormData.amount || !historyFormData.created_at) {
        throw new Error("Please fill in all fields.");
      }

      const payload = {
        user_id: historyFormData.user_id,
        type: 'investment',
        asset: 'USD',
        plan_name: historyFormData.plan_name,
        amount: Number(historyFormData.amount),
        status: historyFormData.status,
        created_at: new Date(historyFormData.created_at).toISOString()
      };

      if (editingHistory) {
        const { error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', editingHistory.id);
        if (error) throw error;
        setSuccessMessage("History record updated successfully.");
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert(payload);
        if (error) throw error;
        setSuccessMessage("History record added successfully.");
      }

      setTimeout(() => setSuccessMessage(null), 3000);
      setIsHistoryModalOpen(false);
      setEditingHistory(null);
      fetchData();
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to save history");
    } finally {
      setProcessingId(null);
    }
  };

  const openAddHistoryModal = () => {
    setHistoryFormData({
      user_id: users[0]?.id || '',
      plan_name: plans[0]?.name || '',
      amount: '',
      status: 'completed',
      created_at: new Date().toISOString().slice(0, 16)
    });
    setEditingHistory(null);
    setIsHistoryModalOpen(true);
  };

  const openEditHistoryModal = (tx: any) => {
    const formatToDatetimeLocal = (isoString: string) => {
      const date = new Date(isoString);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    setHistoryFormData({
      user_id: tx.user_id,
      plan_name: tx.plan_name || '',
      amount: tx.amount.toString(),
      status: tx.status,
      created_at: formatToDatetimeLocal(tx.created_at)
    });
    setEditingHistory(tx);
    setIsHistoryModalOpen(true);
  };

  const openAddModal = () => {
    // Determine default end date
    const plan = plans.length > 0 ? plans[0] : null;
    let defaultEnd = new Date(Date.now() + 86400000); // +1 day fallback
    if (plan && plan.duration_days) {
      defaultEnd = new Date(Date.now() + plan.duration_days * 86400000);
    }

    setFormData({
      user_id: users[0]?.id || '',
      plan_id: plans[0]?.id || '',
      amount: '',
      status: 'active',
      start_date: new Date().toISOString().slice(0, 16),
      end_date: defaultEnd.toISOString().slice(0, 16)
    });
    setEditingInvestment(null);
    setIsAddModalOpen(true);
  };

  // Helper to sync end date when plan changes in Add mode
  const handlePlanChange = (planId: string) => {
    setFormData(prev => {
      const newState = { ...prev, plan_id: planId };
      if (!editingInvestment && prev.start_date) {
        const plan = plans.find(p => p.id === planId);
        if (plan && plan.duration_days) {
          const startDate = new Date(prev.start_date);
          const endDate = new Date(startDate.getTime() + plan.duration_days * 86400000);
          newState.end_date = endDate.toISOString().slice(0, 16);
        }
      }
      return newState;
    });
  };

  const handleStartDateChange = (startDateStr: string) => {
    setFormData(prev => {
      const newState = { ...prev, start_date: startDateStr };
      if (!editingInvestment && startDateStr && prev.plan_id) {
        const plan = plans.find(p => p.id === prev.plan_id);
        if (plan && plan.duration_days) {
          const startDate = new Date(startDateStr);
          const endDate = new Date(startDate.getTime() + plan.duration_days * 86400000);
          newState.end_date = endDate.toISOString().slice(0, 16);
        }
      }
      return newState;
    });
  };

  const openEditModal = (inv: any) => {
    // Make sure we handle potential timezone strings properly by converting to local format
    const formatToDatetimeLocal = (isoString: string) => {
      const date = new Date(isoString);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    setFormData({
      user_id: inv.user_id,
      plan_id: inv.plan_id,
      amount: inv.amount.toString(),
      status: inv.status,
      start_date: formatToDatetimeLocal(inv.start_date),
      end_date: formatToDatetimeLocal(inv.end_date)
    });
    setEditingInvestment(inv);
    setIsAddModalOpen(true);
  };

  const filteredPendingRequests = pendingRequests.filter(req => 
    req.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.plan_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = historyTransactions.filter(tx => 
    tx.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tx.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.plan_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInvestments = investments.filter(inv => 
    inv.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inv.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.investment_plans?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SEOHead title="Admin Staking Pools" description="Review active and past user stakes." path="/admin/investments" noIndex />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Staking Pools</h1>
          <p className="text-white/60 mt-1">Manage, add, and review user stakes and history.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-900 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <button
            onClick={openAddModal}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Add Investment</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
          <AlertTriangle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)} className="ml-auto p-1 hover:bg-red-500/20 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <Check size={20} className="shrink-0" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="rounded-2xl border border-brand-500/30 bg-surface-900 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-brand-500/20 bg-brand-500/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              Pending Requests ({pendingRequests.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs uppercase bg-black/20 text-white/40 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">User</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Requested Plan</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Amount</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{req.profiles?.full_name || 'N/A'}</span>
                        <span className="text-xs text-white/40">{req.profiles?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{req.plan_name || 'Unknown'}</td>
                    <td className="px-6 py-4 font-bold text-white">
                      ${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {new Date(req.created_at).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {processingId === req.id ? (
                          <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleApproveRequest(req)}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                              title="Approve Pool"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req)}
                              className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Reject Request"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/5 bg-surface-900 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Pool History Log (Transactions)</h2>
          <button
            onClick={openAddHistoryModal}
            className="flex items-center gap-2 bg-surface-800 hover:bg-surface-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
          >
            <Plus size={16} />
            <span>Add Record</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs uppercase bg-black/20 text-white/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold tracking-wider">User</th>
                <th className="px-6 py-4 font-bold tracking-wider">Plan</th>
                <th className="px-6 py-4 font-bold tracking-wider">Amount</th>
                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredHistory.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white/60">
                    {new Date(tx.created_at).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{tx.profiles?.full_name || 'N/A'}</span>
                      <span className="text-xs text-white/40">{tx.profiles?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{tx.plan_name || '—'}</td>
                  <td className="px-6 py-4 font-bold text-white">
                    ${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                      tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      tx.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                      'bg-white/10 text-white/50'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditHistoryModal(tx)}
                      className="p-1.5 text-sky-400 hover:bg-sky-400/10 rounded-lg transition-colors"
                      title="Edit History Record"
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-white/40">
                    No history records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-surface-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Active & Past Stakes</h2>
        </div>
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
                  <th className="px-6 py-4 font-bold tracking-wider">Plan</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Amount</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Start Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider">End Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredInvestments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{inv.profiles?.full_name || 'N/A'}</span>
                        <span className="text-xs text-white/40">{inv.profiles?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {inv.investment_plans?.name || 'Unknown Plan'}
                      <div className="text-xs text-emerald-400">{inv.investment_plans?.return_rate_percentage}% Return</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                        inv.status === 'active' ? 'bg-brand-500/10 text-brand-400' :
                        inv.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {new Date(inv.start_date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {new Date(inv.end_date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(inv)}
                          className="p-1.5 text-sky-400 hover:bg-sky-400/10 rounded-lg transition-colors"
                          title="Edit Investment Details"
                        >
                          <Edit2 size={18} />
                        </button>
                        {inv.status === 'active' && (
                          processingId === inv.id ? (
                            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                          ) : (
                            <button
                              onClick={() => handleCancelInvestment(inv)}
                              className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Cancel & Refund"
                            >
                              <Ban size={18} />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInvestments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-white/40">
                      No investments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-white/10 w-full max-w-lg rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsHistoryModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold font-heading mb-6">{editingHistory ? 'Edit History Record' : 'Add History Record'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">User</label>
                <select
                  value={historyFormData.user_id}
                  onChange={e => setHistoryFormData({ ...historyFormData, user_id: e.target.value })}
                  disabled={!!editingHistory}
                  className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 disabled:opacity-50"
                >
                  <option value="" disabled>Select User</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={historyFormData.plan_name}
                    onChange={e => setHistoryFormData({ ...historyFormData, plan_name: e.target.value })}
                    className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Starter Plan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Status</label>
                  <select
                    value={historyFormData.status}
                    onChange={e => setHistoryFormData({ ...historyFormData, status: e.target.value })}
                    className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    value={historyFormData.amount}
                    onChange={e => setHistoryFormData({ ...historyFormData, amount: e.target.value })}
                    className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500"
                    placeholder="e.g. 1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={historyFormData.created_at}
                    onChange={e => setHistoryFormData({ ...historyFormData, created_at: e.target.value })}
                    className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveHistory}
                  disabled={processingId === 'saving_history'}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {processingId === 'saving_history' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                  Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Investment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-white/10 w-full max-w-lg rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold font-heading mb-6">{editingInvestment ? 'Edit Investment' : 'Add Investment'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">User</label>
                <select
                  value={formData.user_id}
                  onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                  disabled={!!editingInvestment}
                  className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 disabled:opacity-50"
                >
                  <option value="" disabled>Select User</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Plan</label>
                  <select
                    value={formData.plan_id}
                    onChange={e => handlePlanChange(e.target.value)}
                    className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="" disabled>Select Plan</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Amount (USD)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500"
                  placeholder="e.g. 1000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={e => handleStartDateChange(e.target.value)}
                    className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveInvestment}
                  disabled={processingId === 'saving'}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {processingId === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                  Save Investment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
