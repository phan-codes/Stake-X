import { motion } from 'framer-motion';
import { Users, Lock, TrendingUp, Award, Coins, Globe, ArrowRight } from 'lucide-react';
import AuthAwareLink from '../common/AuthAwareLink';
import { useEffect, useRef, useState } from 'react';

// Reusing the AnimatedCounter logic for consistent experience
function AnimatedCounter({ end, suffix = '', prefix = '', decimals = 0 }: { end: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start: number | null = null;
    let id: number;
    const dur = 2500; // Slightly longer duration for larger numbers
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      // easeOutExpo
      const easeOut = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount(easeOut * end);
      if (p < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [started, end]);

  return (
    <div ref={ref}>
      {prefix}
      {count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </div>
  );
}

export default function LiveStatsSection() {
  const stats = [
    {
      icon: <Lock size={32} className="text-emerald-400" />,
      value: 48636400.85,
      label: 'TOTAL VALUE LOCKED (TVL)',
      prefix: '$',
      decimals: 2
    },
    {
      icon: <Users size={32} className="text-cyan-400" />,
      value: 12054,
      label: 'ACTIVE STAKERS',
      prefix: '',
      decimals: 0
    },
    {
      icon: <Award size={32} className="text-brand-400" />,
      value: 2166360.48,
      label: 'REWARDS DISTRIBUTED',
      prefix: '$',
      decimals: 2
    },
    {
      icon: <TrendingUp size={32} className="text-brand-400" />,
      value: 18.5,
      label: 'AVERAGE APR',
      prefix: '',
      suffix: '%',
      decimals: 2
    },
    {
      icon: <Coins size={32} className="text-purple-400" />,
      value: 24,
      label: 'SUPPORTED ASSETS',
      prefix: '',
      decimals: 0
    },
    {
      icon: <Globe size={32} className="text-pink-400" />,
      value: 8,
      label: 'SUPPORTED NETWORKS',
      prefix: '',
      decimals: 0
    }
  ];

  return (
    <section id="platform-activity" className="w-full py-24 px-4 relative overflow-hidden bg-surface-950">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Protocol Metrics & <span className="text-gradient">Performance</span></h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Monitor real-time protocol analytics reflecting our global stakers, total value locked, and consistent reward distribution.
          </p>
        </motion.div>

        {/* Live Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-white/5 hover:border-brand-500/30 transition-all"
            >
              <div className="mb-4 p-4 rounded-full bg-surface-800 shadow-inner">
                {stat.icon}
              </div>
              <h3 className="text-4xl font-bold text-white mb-2 tracking-tight">
                <AnimatedCounter 
                  end={stat.value} 
                  prefix={stat.prefix} 
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                />
              </h3>
              <p className="text-white/50 text-sm font-semibold tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Country Representatives Promo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden glass-panel border border-brand-500/20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-center gap-8 justify-between">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-sm font-semibold border border-brand-500/20">
                <Award size={16} />
                <span>Premium Opportunity</span>
              </div>
              <h3 className="text-2xl md:text-4xl font-bold">
                Liquidity Provider <span className="text-brand-400">Program</span>
              </h3>
              <p className="text-white/70 leading-relaxed max-w-2xl text-base md:text-lg">
                Strategic liquidity providers receive dedicated yield multipliers including <span className="text-white font-bold">boosted APR</span>, protocol fee sharing, and exclusive access to premium staking pools.
              </p>
              <div className="bg-surface-800/50 rounded-xl p-4 border border-white/5 inline-block">
                <p className="text-sm text-white/80">
                  <span className="font-bold text-brand-400">Qualifications:</span> Requires a minimum strategic TVL allocation of $20,000 or providing liquidity across 3+ supported networks.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 w-full lg:w-auto">
              <AuthAwareLink 
                to="/register" 
                className="w-full lg:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 text-surface-950 font-bold rounded-xl hover:bg-brand-400 transition-all hover:scale-105"
              >
                Apply Now <ArrowRight size={20} />
              </AuthAwareLink>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
