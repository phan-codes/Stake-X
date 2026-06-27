import { useState } from "react";
import { Banknote, AlertCircle, Loader2, FileText } from "lucide-react";
import SEOHead from '../components/SEOHead';

export default function LoanPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [showError, setShowError] = useState(false);

  const checkEligibility = () => {
    setIsChecking(true);
    setShowError(false);

    // Simulate a processing delay
    setTimeout(() => {
      setIsChecking(false);
      setShowError(true);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <SEOHead title="Borrow" description="Borrow stablecoins against your staked crypto assets on StakeX." path="/dashboard/loan" noIndex />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">Borrow</h1>
        <p className="text-white/50 mt-1">Crypto-backed decentralized liquidity.</p>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-surface-900/60 flex items-center gap-2">
          <FileText className="h-4 w-4 text-brand-400" />
          <h2 className="text-xs font-bold tracking-widest uppercase text-white/50">DeFi Borrowing Facility</h2>
        </div>
        <div className="p-6 sm:p-8 space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <Banknote size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Borrow Stablecoins</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Eligible stakers maintaining a minimum portfolio value across our staking pools can access flexible liquidity directly against their active positions. With up to 60% LTV (Loan-to-Value) and no forced repayment schedules, you can borrow stablecoins ranging from <span className="text-brand-400 font-bold">$5,000</span> to <span className="text-brand-400 font-bold">$1,000,000</span> while your collateral continues earning yield.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={checkEligibility}
              disabled={isChecking}
              className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Eligibility"
              )}
            </button>
          </div>

          {showError && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-bold uppercase tracking-wide">
                Sorry, your portfolio health factor is too low to borrow at the moment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
