import { motion } from 'framer-motion';
import BitcoinNetworkAnimation from '../animations/BitcoinNetwork';

export default function BitcoinSection() {
  return (
    <section id="bitcoin" className="w-full py-24 px-4 bg-surface-900/30 relative overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[200px]"
      />

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8">What is <span className="text-gradient">Cryptocurrency?</span></h2>
            <div className="space-y-4 text-white/70 leading-relaxed">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Cryptocurrency represents a paradigm shift in global finance—a decentralized digital asset class secured by advanced cryptography. Unlike traditional fiat currencies managed by central banks, cryptocurrencies operate on distributed ledger technology, ensuring transparency, immutability, and resilience against single points of failure.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                At the foundation of this ecosystem is blockchain technology. This distributed infrastructure enables peer-to-peer value transfer without intermediaries, significantly reducing friction, lowering settlement costs, and accelerating cross-border transactions through automated consensus mechanisms and sophisticated cryptographic protocols.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                Beyond serving as a borderless medium of exchange, the digital asset landscape has evolved into a comprehensive financial ecosystem. From Decentralized Finance (DeFi) protocols and algorithmic stablecoins to smart contract infrastructure, this technology is actively reshaping the future of capital markets, liquidity provisioning, and digital ownership.
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: 15 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bitcoin-animation-wrap relative w-full max-w-[22rem] sm:max-w-xl mx-auto justify-self-center"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl overflow-hidden relative"
            >
              <BitcoinNetworkAnimation />
            </motion.div>
            <div className="absolute -inset-4 bg-cyan-500/5 blur-3xl rounded-full -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
