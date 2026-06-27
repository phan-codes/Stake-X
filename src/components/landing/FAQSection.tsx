import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';


const faqs = [
  {
    question: "What is StakeX?",
    answer: "StakeX is a premium decentralized staking protocol providing secure smart contract interactions, high-yield pools, and DeFi services designed for institutional and retail stakers alike."
  },
  {
    question: "How do I create an account?",
    answer: "The onboarding process is streamlined and secure. Simply navigate to the registration portal, provide the required information, and verify your identity to establish your client profile."
  },
  {
    question: "How do I stake my assets?",
    answer: "Navigate to your dashboard, select 'Stake Assets', choose your preferred network, and follow the generated cryptographic instructions to transfer funds securely to the protocol."
  },
  {
    question: "What are the typical staking processing times?",
    answer: "Stakes are credited automatically upon receiving the requisite number of network confirmations on the respective blockchain. Processing times vary depending on network congestion."
  },
  {
    question: "How do I unstake my assets?",
    answer: "Unstaking requests can be initiated directly from your portfolio dashboard. Specify the destination wallet address and amount, then authenticate the transaction using your security credentials."
  },
  {
    question: "How long do withdrawals take to process?",
    answer: "We process withdrawal requests promptly. Funds are typically broadcasted to the network immediately, subject to standard blockchain processing times and our automated security protocols."
  },
  {
    question: "Am I permitted to maintain multiple accounts?",
    answer: "To comply with our strict Anti-Money Laundering (AML) policies and maintain platform integrity, each user is permitted to operate only one individual account."
  },
  {
    question: "Are there limitations on staking frequency?",
    answer: "There are no restrictions on the frequency of staking. You may stake into multiple pools across supported networks as your portfolio strategy dictates."
  }
];

function FAQItem({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) {
  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden bg-surface-900/40 hover:bg-surface-900/60 transition-colors">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left focus:outline-none"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isOpen ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-800 text-white/50'}`}>
            <HelpCircle size={18} className="sm:w-5 sm:h-5" />
          </div>
          <span className="text-base sm:text-lg font-semibold text-white">{question}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/50 shrink-0"
        >
          <ChevronDown size={18} className="sm:w-5 sm:h-5" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 sm:pt-2 pl-[58px] sm:pl-[72px] text-sm sm:text-base text-white/60 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  return (
    <section id="faq" className="w-full py-24 px-4 bg-surface-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-500/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-4">
            <MessageCircle size={16} />
            <span>Support Center</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Find answers to commonly asked questions about StakeX. Can't find what you're looking for? Reach out to our support team.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <FAQItem
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center p-8 glass-panel rounded-2xl border border-white/5"
        >
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-white/60 mb-6">Our dedicated support team is available 24/7 to assist you.</p>
          <a 
            href="mailto:support@stakex.finance" 
            className="inline-flex items-center justify-center px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}
