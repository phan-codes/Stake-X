import { motion } from 'framer-motion';

const partners = [
  { name: 'Bitcoin', svg: '₿', color: '#F7931A' },
  { name: 'Dogecoin', svg: 'Ð', color: '#C3A634' },
  { name: 'Litecoin', svg: 'Ł', color: '#345D9D' },
  { name: 'Zcash', svg: 'ⓩ', color: '#ECB244' },
  { name: 'Monero', svg: 'ɱ', color: '#FF6600' },
  { name: 'Ripple', svg: '✕', color: '#0085C0' },
  { name: 'Ethereum', svg: 'Ξ', color: '#627EEA' },
  { name: 'Tether', svg: '₮', color: '#26A17B' },
];

export default function PartnersSection() {
  return (
    <section id="partners" className="w-full py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold">Supported <span className="text-gradient">Currencies</span></h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12 max-w-4xl mx-auto">
          {partners.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.15, y: -5 }}
              className="flex items-center gap-3 group cursor-default"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold border border-white/10 group-hover:border-white/30 transition-all"
                style={{ backgroundColor: p.color + '20', color: p.color }}
              >
                {p.svg}
              </div>
              <span className="text-white/70 font-semibold text-sm group-hover:text-white transition-colors">{p.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
