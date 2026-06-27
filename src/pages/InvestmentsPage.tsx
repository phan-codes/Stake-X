import { useState, useEffect } from "react";
import { Clock, DollarSign, ArrowUpRight, AlertTriangle, CheckCircle2, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { notifyAdmin } from "../lib/email";
import SEOHead from '../components/SEOHead';

const INVESTMENT_PLANS = [
  { id: "starter", name: "USDT Stable Pool", duration: "Flexible", min: 1000, max: 9999, returnRate: "10% APR" },
  { id: "premium", name: "Ethereum Pool", duration: "30 Days Lock", min: 10000, max: 49999, returnRate: "22% APR" },
  { id: "gold", name: "Bitcoin Pool", duration: "90 Days Lock", min: 50000, max: null, returnRate: "35% APR" }
];

export default function InvestmentsPage() {
  const { user } = useAuth();
  const { balances } = useDashboardData();
  const [selectedPlan, setSelectedPlan] = useState<typeof INVESTMENT_PLANS[0] | null>(null);
  const [investAmount, setInvestAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(true);

  const userBalance = balances.reduce((acc, curr) => acc + Number(curr.balance), 0);

  // Fetch user's active investments
  useEffect(() => {
    if (!user) return;
    const fetchActiveInvestments = async () => {
      setLoadingInvestments(true);
      const { data } = await (supabase as any)
        .from('user_investments')
        .select(`*, investment_plans:plan_id (name, return_rate_percentage, duration_days)`)
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });
      if (data) setActiveInvestments(data);
      setLoadingInvestments(false);
    };
    fetchActiveInvestments();

    const channel = supabase
      .channel('my_investments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_investments', filter: `user_id=eq.${user.id}` }, fetchActiveInvestments)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSubmitInvestment = async () => {
    if (!selectedPlan || !user) return;
    const amount = parseFloat(investAmount);

    if (isNaN(amount) || amount < selectedPlan.min) {
      return setErrorMessage(`Minimum stake is $${selectedPlan.min.toLocaleString()}.`);
    }
    if (selectedPlan.max && amount > selectedPlan.max) {
      return setErrorMessage(`Maximum stake is $${selectedPlan.max.toLocaleString()}.`);
    }
    if (userBalance < amount) {
      return setErrorMessage(`Insufficient Balance. Your current balance is $${userBalance.toLocaleString()}.`);
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "investment",
        asset: "USD",
        amount: amount,
        status: "pending",
        plan_name: selectedPlan.name,
      });

      if (error) throw error;
      
      // Send email notifications (fire-and-forget)
      notifyAdmin('investment_notification_admin', {
        email: user.email,
        plan_name: selectedPlan.name,
        amount: amount,
      });

      setShowSuccess(true);
      setSelectedPlan(null);
      setInvestAmount("");
    } catch {
      setErrorMessage("Failed to submit staking request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'completed': return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'cancelled': return 'bg-red-500/15 text-red-400 border-red-500/30';
      default: return 'bg-white/10 text-white/50 border-white/10';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SEOHead title="Staking Pools" description="Choose a staking pool to start earning decentralized yields." path="/dashboard/investments" noIndex />
      
      {/* My Active Investments Section */}
      {!loadingInvestments && activeInvestments.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading">Active Pools</h2>
              <p className="text-white/40 text-sm">{activeInvestments.filter(i => i.status === 'active').length} active pool{activeInvestments.filter(i => i.status === 'active').length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {activeInvestments.map((inv) => (
              <div key={inv.id} className={`glass-panel rounded-xl p-5 border transition-all ${inv.status === 'active' ? 'border-emerald-500/20' : 'border-white/5'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold font-heading text-white">{inv.investment_plans?.name || 'Pool'}</h3>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${getStatusStyle(inv.status)}`}>
                    {inv.status}
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono text-brand-400 mb-4">
                  ${Number(inv.amount).toLocaleString()}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/40">Reward APR</span>
                    <span className="text-emerald-400 font-bold">{inv.investment_plans?.return_rate_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Start</span>
                    <span className="text-white/70 font-medium">{new Date(inv.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">End</span>
                    <span className="text-white/70 font-medium">{new Date(inv.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                {inv.status === 'active' && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                      </span>
                      Earning Yield
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingInvestments && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
        </div>
      )}

      {/* Investment Plans Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">Staking Pools</h1>
        <p className="text-white/50 mt-1">Select a staking pool to lock your assets and generate yield.</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
        {INVESTMENT_PLANS.map((plan) => (
          <div key={plan.id} onClick={() => { setSelectedPlan(plan); setInvestAmount(String(plan.min)); setErrorMessage(null); }} className="glass-panel border border-brand-500/20 hover:border-brand-500/50 rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold font-heading">{plan.name}</h3>
                <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg"><DollarSign size={20} /></div>
              </div>
              <p className="text-3xl font-bold text-brand-400 mb-6">{plan.returnRate}</p>
              
              <div className="space-y-3 pt-4 border-t border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-white/40" />
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Duration</p>
                    <p className="text-sm font-bold">{plan.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-white/40" />
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Minimum</p>
                    <p className="text-sm font-bold">${plan.min.toLocaleString()}{!plan.max && '+'}</p>
                  </div>
                </div>
                {plan.max && (
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="w-4 h-4 text-white/40" />
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Maximum</p>
                    <p className="text-sm font-bold">${plan.max.toLocaleString()}</p>
                  </div>
                </div>
                )}
              </div>

              <button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-colors">
                Stake Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 sm:p-8 relative">
            <h2 className="text-2xl font-bold font-heading mb-2">{selectedPlan.name}</h2>
            <p className="text-white/50 text-sm mb-6">Enter the amount you want to stake.</p>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 bg-surface-950 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-sm text-white/50">Your Balance</span>
                <span className="text-emerald-400 font-bold">${userBalance.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Stake Amount (USD)</label>
                <input
                  type="number"
                  min={selectedPlan.min}
                  max={selectedPlan.max || undefined}
                  value={investAmount}
                  onChange={(e) => { setInvestAmount(e.target.value); setErrorMessage(null); }}
                  placeholder={`Min $${selectedPlan.min.toLocaleString()}`}
                  className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              {errorMessage && (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
                  <AlertTriangle size={18} />
                  <p className="text-sm">{errorMessage}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedPlan(null)} className="flex-1 px-4 py-3 border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleSubmitInvestment} disabled={isSubmitting} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-colors">
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="w-16 h-16 mx-auto bg-emerald-500/10 text-emerald-400 flex items-center justify-center rounded-full mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-2">Staking Request Submitted</h2>
            <p className="text-white/60 text-sm mb-8">
              Your staking request is now pending protocol confirmation.
            </p>
            <button onClick={() => setShowSuccess(false)} className="w-full bg-surface-900 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/5 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
