import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import AuthAwareLink from '../common/AuthAwareLink';

export default function CTASection() {
  return (
    <section className="w-full py-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="container mx-auto glass-panel rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
      >
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-0 right-0 w-72 h-72 bg-brand-500/20 blur-[100px] rounded-full"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 blur-[100px] rounded-full"
        />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-bold mb-6 relative z-10"
        >
          Access the Future of <span className="text-gradient">Decentralized Finance</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-lg text-white/70 mb-8 max-w-2xl mx-auto relative z-10"
        >
          Join a global community of forward-thinking stakers and liquidity providers leveraging StakeX's advanced infrastructure for digital asset management and DeFi yield generation.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex flex-col lg:flex-row w-full sm:w-auto items-center justify-center gap-4 relative z-10"
        >
          <AuthAwareLink to="/register" className="flex sm:inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 bg-brand-500 text-surface-950 text-sm font-bold rounded-full hover:bg-brand-400 hover:scale-105 transition-all">
            Open an Account <ChevronRight size={20} />
          </AuthAwareLink>
          <AuthAwareLink to="/login" className="flex sm:inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 bg-surface-800 border text-sm border-white/10 text-white font-bold rounded-full hover:bg-white/5 hover:border-white/20 transition-all">
            Login to Portal <ArrowRight size={20} />
          </AuthAwareLink>
        </motion.div>
      </motion.div>
    </section>
  );
}
