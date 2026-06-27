import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { notifyAdmin } from "../lib/email";
import SEOHead from '../components/SEOHead';

const CRYPTO_CHANNELS = [
  { id: "usdt-erc20", name: "USDT(ERC20)", symbol: "USDT", coinId: "tether" },
  { id: "usdc-erc20", name: "USDC(ERC20)", symbol: "USDC", coinId: "usd-coin" },
];

export default function WithdrawPage() {
  const navigate = useNavigate();
  const { balances } = useDashboardData();
  const { user } = useAuth();
  
  const [amount, setAmount] = useState<string>("");
  const [channel, setChannel] = useState<string>("usdt-erc20");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWalletAlert, setShowWalletAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalBalance = balances.reduce((acc, curr) => acc + Number(curr.balance), 0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=tether,usd-coin&vs_currencies=usd");
        const data = await response.json();
        const newPrices: Record<string, number> = {};
        if (data) {
          Object.keys(data).forEach((coin) => {
            newPrices[coin] = data[coin].usd;
          });
        }
        setPrices(newPrices);
      } catch {
        // ignore
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const selectedCrypto = CRYPTO_CHANNELS.find((c) => c.id === channel) || CRYPTO_CHANNELS[0];
  const cryptoPrice = prices[selectedCrypto.coinId];
  const cryptoEquivalent = amount && cryptoPrice ? (parseFloat(amount) / cryptoPrice).toFixed(6) : "0.000000";

  const handleWithdraw = async () => {
    setError(null);
    setShowWalletAlert(false);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount to unstake.");
      return;
    }
    if (numAmount > totalBalance) {
      setError(`Insufficient funds. Your total balance is $${totalBalance.toLocaleString()}.`);
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    try {
      const [{ data: walletAddrs }, { data: connectedWallets }] = await Promise.all([
        (supabase as any).from("wallet_addresses").select("*").eq("user_id", user.id),
        (supabase as any).from("connected_wallets").select("*").eq("user_id", user.id).neq("status", "disconnected")
      ]);
      
      const hasAddedAddress = walletAddrs && walletAddrs.length > 0;
      const hasConnectedWallet = connectedWallets && connectedWallets.length > 0;

      if (!hasAddedAddress && !hasConnectedWallet) {
        setShowWalletAlert(true);
        setIsSubmitting(false);
        return;
      }

      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "withdraw",
        asset: selectedCrypto.symbol,
        amount: numAmount,
        status: "pending",
      });

      if (txError) throw txError;
      
      // Send email notifications (fire-and-forget)
      notifyAdmin('withdrawal_notification_admin', {
        email: user.email,
        amount: numAmount,
      });

      setShowSuccessModal(true);
      setAmount("");
    } catch {
      setError("Failed to process unstake request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <SEOHead title="Unstake" description="Submit a request to unstake assets from your portfolio." path="/dashboard/withdraw" noIndex />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">Unstake Assets</h1>
        <p className="text-white/50 mt-1">Submit a request to unstake assets from your portfolio.</p>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-surface-900/60">
          <h2 className="text-xs font-bold tracking-widest uppercase text-white/50">Your Account Details</h2>
        </div>
        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Account Balance</p>
          <p className="text-3xl font-bold text-white">${totalBalance.toLocaleString()}</p>
        </div>
      </div>

      {showWalletAlert && (
        <div className="glass-panel rounded-xl overflow-hidden border-red-500/30">
          <div className="bg-red-500/20 text-red-400 p-3 font-bold text-center border-b border-red-500/20">Action Required</div>
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <p className="text-white/80 text-sm leading-relaxed">
                You can only unstake assets after you have your actively confirmed on-chain wallet connected to our platform.
                <br/><br/>
                To do this, navigate to Profile Settings and click on the "Connect Wallet" tab.
              </p>
            </div>
            <button onClick={() => navigate('/dashboard/profile')} className="w-full bg-surface-900 border border-white/10 hover:bg-white/5 py-3 rounded-xl font-bold transition-colors">
              Go to Profile Settings
            </button>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-surface-900/60">
          <h2 className="text-xs font-bold tracking-widest uppercase text-white/50">Make New Unstake Request</h2>
        </div>
        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
              <AlertTriangle size={20} />
              <p className="text-sm flex-1">{error}</p>
              <button onClick={() => setError(null)}><X size={16} /></button>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/70">Enter amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setShowWalletAlert(false); }}
              className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="Amount in USD"
              min="0"
              max={totalBalance}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/70">Channel</label>
            <select
              value={channel}
              onChange={(e) => { setChannel(e.target.value); setShowWalletAlert(false); }}
              className="w-full bg-surface-950 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition-colors text-white"
            >
              {CRYPTO_CHANNELS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {amount && !isNaN(parseFloat(amount)) && (
            <div className="p-4 bg-surface-950 rounded-xl text-center border border-white/5">
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Equivalent Amount</p>
              {prices[selectedCrypto.coinId] ? (
                <p className="text-2xl font-bold text-emerald-400">~ {cryptoEquivalent} {selectedCrypto.symbol}</p>
              ) : (
                <p className="text-sm text-white/40 animate-pulse mt-2">Fetching live price...</p>
              )}
            </div>
          )}
        </div>
        <div className="p-4 bg-surface-900/40 border-t border-white/5 flex">
          <button 
            onClick={handleWithdraw}
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {isSubmitting ? "Processing..." : "Unstake"}
          </button>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>
            <div className="w-16 h-16 mx-auto bg-emerald-500/10 text-emerald-400 flex items-center justify-center rounded-full mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold font-heading mb-2">Unstake Request Submitted</h2>
            <p className="text-white/60 text-sm mb-8">
              Your unstake request has been submitted. It is set to <strong className="text-brand-400">Pending</strong> until confirmed by the protocol.
            </p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
