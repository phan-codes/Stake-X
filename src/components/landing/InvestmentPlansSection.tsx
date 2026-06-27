import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AuthAwareLink from '../common/AuthAwareLink';

const plans = [
  { name: 'USDT Stable Pool', returnRate: '10%', returnType: 'Fixed APR', min: '$1,000', max: '$9,999', duration: 'Flexible', totalReturn: '10% APR', color: 'bg-cyan-500' },
  { name: 'Ethereum Pool', returnRate: '22%', returnType: 'Dynamic Yield', min: '$10,000', max: '$49,999', duration: '30 Days Lock', totalReturn: '22% APR', color: 'bg-brand-500', popular: true },
  { name: 'Bitcoin Pool', returnRate: '35%', returnType: 'Dynamic Yield', min: '$50,000', max: '$50,000 +', duration: '90 Days Lock', totalReturn: '35% APR', color: 'bg-emerald-500' },
];

export default function InvestmentPlansSection() {
  return (
    <section id="investment-plans" className="w-full py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Staking <span className="text-gradient">Pools</span></h2>
          <p className="text-white/60 max-w-2xl mx-auto">We offer structured staking pools designed to accommodate diverse asset allocation strategies, each featuring transparent smart contracts and sustainable APY.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              className={`glass-panel rounded-2xl p-8 relative group transition-all duration-300 ${plan.popular ? 'border-brand-500/30 ring-1 ring-brand-500/20' : ''}`}
            >
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500 text-surface-950 text-xs font-bold rounded-full"
                >
                  MOST POPULAR
                </motion.div>
              )}
              <div className={`inline-block px-4 py-1 rounded-full ${plan.color} text-white text-sm font-bold mb-6`}>
                {plan.name}
              </div>
              <div className="text-4xl font-black text-white mb-2">{plan.returnRate}</div>
              <p className="text-white/50 text-sm mb-6">{plan.returnType}</p>

              <div className="space-y-3 text-left border-t border-white/5 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Min Stake</span>
                  <span className="text-white font-semibold">{plan.min}</span>
                </div>
                {!plan.max.includes('+') && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Max Stake</span>
                  <span className="text-white font-semibold">{plan.max}</span>
                </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Lock Duration</span>
                  <span className="text-white font-semibold">{plan.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Estimated Rewards</span>
                  <span className="text-emerald-400 font-bold">{plan.totalReturn}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Auto-Compound</span>
                  <span className="text-white font-semibold">Yes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Smart Contract Audited</span>
                  <span className="text-white font-semibold">Yes</span>
                </div>
              </div>

              <AuthAwareLink to="/register" className={`mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all text-sm ${plan.popular ? 'bg-brand-500 text-surface-950 hover:bg-brand-400' : 'bg-surface-800 text-white border border-white/10 hover:border-brand-500/30'}`}>
                Get Started <ArrowRight size={16} />
              </AuthAwareLink>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
