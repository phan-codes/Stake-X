import { motion } from 'framer-motion';
import AuthAwareLink from '../common/AuthAwareLink';
import CryptoWorldBackground from '../animations/CryptoWorldBackground';

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Absolute 3D Background */}
      <div className="absolute inset-0 z-0">
        <CryptoWorldBackground />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center max-w-4xl mx-auto px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8 text-sm font-medium text-brand-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          Trusted by 10,000+ Active Stakers
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight text-white"
        >
          StakeX - <br className="hidden sm:block" />
          <span className="text-gradient">Secure DeFi Staking Protocol</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-base md:text-lg text-white/80 mb-10 max-w-3xl mx-auto font-medium leading-relaxed"
        >
          StakeX is a premium decentralized platform for multi-asset staking, liquidity provision, and DeFi yield generation. We focus on secure smart contract interactions, transparent asset management, and high-yield opportunities for both new and experienced stakers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-sm sm:max-w-none mx-auto"
        >
          <AuthAwareLink to="/login" className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-brand-500 text-surface-950 font-bold rounded-full hover:bg-brand-400 hover:scale-105 transition-all flex items-center justify-center gap-2 text-base tracking-wide">
            START STAKING
          </AuthAwareLink>
          <AuthAwareLink to="/register" className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-cyan-500 text-white font-bold rounded-full hover:bg-cyan-400 hover:scale-105 transition-all flex items-center justify-center gap-2 text-base tracking-wide">
            EXPLORE POOLS
          </AuthAwareLink>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 z-10 flex flex-col items-center gap-2 max-md:hidden [@media(max-height:820px)]:hidden"
      >
        <span className="text-white/40 text-xs tracking-widest uppercase">Scroll Down</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 bg-brand-400 rounded-full"></div>
        </motion.div>
      </motion.div>
    </section>
  );
}
