import { useEffect } from "react";
import { motion } from "framer-motion";
import SEOHead from '../components/SEOHead';

export default function AmlPolicyPage() {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<div className="min-h-screen bg-surface-950 pt-24 pb-20 relative overflow-hidden">
			<SEOHead
				title="AML Policy"
				description="StakeX's Anti-Money Laundering (AML) policy. Learn about our KYC verification, transaction monitoring, and compliance standards."
				path="/aml"
			/>
			{/* Ambient background effects */}
			<div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[180px] pointer-events-none" />
			<div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-600/5 rounded-full blur-[160px] pointer-events-none" />

			<div className="container mx-auto px-4 max-w-4xl relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-12">
					
					{/* Header */}
					<div className="text-center space-y-4">
						<h1 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">
							Anti-Money Laundering <span className="text-brand-500">(AML) Policy</span>
						</h1>
						<p className="text-white/50 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
					</div>

					{/* Content */}
					<div className="prose prose-invert prose-brand max-w-none text-white/70 space-y-8 leading-relaxed">
						<section className="bg-surface-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm">
							<p>
								<span className="text-white font-semibold">StakeX</span> is committed to the highest standards of
								Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) compliance. We strictly adhere to
								international regulations to prevent our platform from being used for illicit activities.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								Identity Verification (KYC)
							</h2>
							<p>
								To ensure compliance, we require all users to complete a mandatory Know Your Customer (KYC) verification
								process before accessing certain features, such as deposits, withdrawals, and advanced trading. This
								includes providing government-issued identification and proof of address.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								Transaction Monitoring
							</h2>
							<p>
								We employ automated and manual systems to monitor transactions for suspicious activity. Any activity
								deemed unusual or potentially linked to money laundering, fraud, or terrorist financing will be
								investigated and may be reported to the relevant authorities.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								Account Restrictions
							</h2>
							<p>
								StakeX reserves the right to suspend, restrict, or terminate any account that fails to comply
								with our AML/CTF policies or refuses to provide requested documentation during an investigation.
							</p>
						</section>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
