import { motion } from 'framer-motion';
import AuthAwareLink from '../common/AuthAwareLink';
import GlobalNetworkAnimation from '../animations/GlobalNetworkAnimation';

export default function AboutSection() {
  return (
    <section id="about" className="w-full py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 text-center"
        >
          About <span className="text-gradient">Us</span>
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <p className="text-white/70 leading-relaxed text-base">
              StakeX is an institutional-grade protocol developed by blockchain technologists, quantitative analysts, and DeFi specialists. Our core mission is to democratize access to high-yield staking pools and decentralized infrastructure with an emphasis on security, transparency, and operational excellence.
            </p>
            <p className="text-white/70 leading-relaxed text-base">
              We provide a comprehensive suite of services including advanced asset staking, liquidity provision, and sophisticated DeFi tools within a unified ecosystem. The platform is meticulously engineered to serve the rigorous demands of experienced yield farmers while maintaining an intuitive experience for newer entrants.
            </p>
            <p className="text-white/70 leading-relaxed text-base">
              We remain steadfast in our commitment to smart contract security, robust risk management, and fostering long-term value for our global stakers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <AuthAwareLink to="/register" className="px-6 py-3 bg-brand-500 text-surface-950 font-bold rounded-full hover:bg-brand-400 hover:scale-105 transition-all text-center text-sm">
                Get Started
              </AuthAwareLink>
            </div>
          </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="about-animation-wrap relative w-full max-w-[22rem] sm:max-w-xl mx-auto justify-self-center"
            >
              <div className="rounded-2xl overflow-hidden relative">
                <GlobalNetworkAnimation />
              </div>
            </motion.div>
        </div>
      </div>
    </section>
  );
}
