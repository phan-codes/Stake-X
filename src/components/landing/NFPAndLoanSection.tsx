import { motion } from 'framer-motion';
import { TrendingUp, Activity, ArrowRight, ShieldCheck, Coins } from 'lucide-react';
import AuthAwareLink from '../common/AuthAwareLink';

export default function NFPAndLoanSection() {
  return (
    <section id="nfp-loan" className="w-full py-24 px-4 bg-surface-900/60 border-y border-white/5 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* DeFi Lending Section */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold mb-2">
              <TrendingUp size={16} />
              <span>Crypto-Backed Borrowing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Decentralized Lending & <br className="hidden md:block" />
              <span className="text-gradient">Borrowing Protocol</span>
            </h2>
            <p className="text-white/70 leading-relaxed">
              StakeX offers sophisticated access to global decentralized liquidity markets, allowing you to borrow stablecoins directly against your staked crypto assets.
            </p>
            <p className="text-white/70 leading-relaxed">
              Our smart contracts support automated loan-to-value (LTV) monitoring, empowering clients to execute advanced leveraging strategies without liquidating their existing market positions.
            </p>
            <p className="text-white/70 leading-relaxed">
              Qualifying stakers gain access to our institutional borrowing facility, ensuring continuous capital availability with minimal collateral risk.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                "Instant Stablecoin Liquidity",
                "Competitive Borrowing APY",
                "No Credit Checks Required"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white/80 text-sm">
                  <ShieldCheck size={18} className="text-brand-400" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Loans Section */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="glass-panel p-8 md:p-10 rounded-3xl border border-brand-500/20 bg-gradient-to-br from-surface-800 to-surface-900/80 shadow-2xl relative overflow-hidden">
              {/* Highlight effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-[40px]" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-brand-500/10 rounded-2xl border border-brand-500/20">
                  <Activity size={32} className="text-brand-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">DeFi Borrowing Facility</h3>
                  <p className="text-brand-400/80 text-sm font-medium">Premium Protocol Benefits</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <p className="text-white/70 text-sm leading-relaxed">
                  Access to capital should be seamless. StakeX extends flexible liquidity to clients maintaining a minimum portfolio value of{' '}
                  <strong className="text-white">$50,000</strong> across our staking pools, directly collateralizing active positions to maximize capital efficiency.
                </p>
                
                <div className="bg-surface-950/50 p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-start gap-3">
                     <Coins size={20} className="text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-white/80">Borrow stablecoins up to <strong className="text-white">60% LTV</strong> (Loan-to-Value) against your staked assets.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp size={20} className="text-cyan-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-white/80">No forced repayment schedules. Keep your position open as long as your Health Factor is safely above 1.0.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={20} className="text-brand-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-white/80">Isolated risk markets ensure your collateral is safely walled off from broader protocol volatility.</p>
                  </div>
                </div>
                <p className="text-xs text-white/50 text-center uppercase tracking-widest pt-2">
                  Elevated Decentralized Infrastructure by StakeX
                </p>
              </div>

              <AuthAwareLink 
                to="/register" 
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-surface-950 font-bold rounded-xl hover:from-brand-400 hover:to-brand-500 transition-colors"
              >
                Start Today <ArrowRight size={18} />
              </AuthAwareLink>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
