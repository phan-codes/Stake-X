import { motion } from 'framer-motion';
import { Globe, Lock, Handshake, Server, Shield, DollarSign, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
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
    const dur = 2000;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [started, end]);

  return <div ref={ref}>{prefix}{count}{suffix}</div>;
}

const features = [
  { icon: <Globe size={40} className="text-cyan-400" />, title: 'Integrated Liquidity', desc: 'Access deep liquidity pools and execute seamless digital asset exchanges directly within our secure trading infrastructure.' },
  { icon: <Lock size={40} className="text-brand-400" />, title: 'Asset Protection', desc: 'Client assets are safeguarded through multi-signature cold storage, rigorous reserve controls, and institutional-grade security protocols.' },
  { icon: <Handshake size={40} className="text-teal-400" />, title: 'Smart Contract Infrastructure', desc: 'Leveraging automated smart contracts to ensure transparent execution, immutable record-keeping, and trustless operational integrity.' },
];

const stats = [
  { icon: <Server size={36} className="text-cyan-400" />, value: 150, suffix: '+ PH/s', label: 'System Capacity' },
  { icon: <Shield size={36} className="text-brand-400" />, value: 99, suffix: '.98%', label: 'Network Uptime' },
  { icon: <DollarSign size={36} className="text-emerald-400" />, value: 0, prefix: '$', suffix: '', label: 'Onboarding Fee' },
  { icon: <Clock size={36} className="text-violet-400" />, value: 24, suffix: '/7', label: 'Dedicated Support' },
];

export default function AdvantageSection() {
  return (
    <section id="advantages" className="w-full py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-surface-900/40 relative overflow-hidden">
      {/* Animated background gradient blobs */}
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut' }}
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]"
      />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Institutional Grade <span className="text-gradient">Infrastructure</span></h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mb-16">
          {features.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="text-center group"
            >
              <div className="relative mb-6">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.3, duration: 0.6 }}
                  className="h-1 bg-gradient-to-r from-cyan-500 to-brand-500 rounded-full mb-8 origin-left"
                />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-flex p-5 rounded-2xl bg-surface-900/80 border border-white/5 group-hover:border-brand-500/30 transition-all duration-300"
                >
                  {item.icon}
                </motion.div>
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05 }}
              className="glass-panel rounded-2xl p-6 text-center group hover:border-brand-500/20 transition-all cursor-default"
            >
              <div className="flex justify-center mb-3">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                  {stat.icon}
                </motion.div>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix || ''} />
              </h3>
              <p className="text-brand-400 text-sm font-medium mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
