import { motion } from 'framer-motion';
import { ShieldCheck, Layers, Activity } from 'lucide-react';

const steps = [
  { step: '1', title: 'Account Registration', desc: 'Complete our secure onboarding process to establish your account profile and verify your identity.', icon: <ShieldCheck size={32} className="text-brand-500" /> },
  { step: '2', title: 'Select a Staking Pool', desc: 'Choose the staking pool that aligns with your asset allocation, lock duration, and yield objectives.', icon: <Layers size={32} className="text-brand-500" /> },
  { step: '3', title: 'Earn & Manage', desc: 'Monitor real-time portfolio performance, track rewards, and manage your assets through a unified dashboard.', icon: <Activity size={32} className="text-brand-500" /> },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Streamlined <span className="text-gradient">Onboarding</span></h2>
          <p className="text-white/60 max-w-2xl mx-auto">Access institutional-grade staking infrastructure and digital asset management tools through our streamlined three-step onboarding process.</p>
        </motion.div>

        {/* Connection line between steps (desktop) */}
        <div className="hidden lg:block absolute top-[55%] left-1/2 -translate-x-1/2 w-[60%] h-px">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent origin-left"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="glass-panel p-8 rounded-2xl relative group"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 + 0.3, type: 'spring', stiffness: 300 }}
                className="absolute -top-5 left-6 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center font-bold text-base text-white z-10"
              >
                {item.step}
              </motion.div>
              <div className="mb-6 mt-2 p-4 bg-brand-500/10 rounded-xl inline-block group-hover:bg-brand-500/20 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-white/60 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
