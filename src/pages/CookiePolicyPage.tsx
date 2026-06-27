import { useEffect } from "react";
import { motion } from "framer-motion";
import SEOHead from '../components/SEOHead';

export default function CookiePolicyPage() {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<div className="min-h-screen bg-surface-950 pt-24 pb-20 relative overflow-hidden">
			<SEOHead
				title="Cookie Policy"
				description="Understand how StakeX uses cookies and similar technologies. Learn about your rights and how to control cookie preferences."
				path="/cookies"
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
							Cookie <span className="text-brand-500">Policy</span>
						</h1>
						<p className="text-white/50 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
					</div>

					{/* Content */}
					<div className="prose prose-invert prose-brand max-w-none text-white/70 space-y-8 leading-relaxed">
						<section className="bg-surface-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm">
							<p>
								This Cookie Policy explains how <span className="text-white font-semibold">StakeX</span> uses
								cookies and similar technologies to recognize you when you visit our website. It explains what these
								technologies are and why we use them, as well as your rights to control our use of them.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								What are cookies?
							</h2>
							<p>
								Cookies are small data files that are placed on your computer or mobile device when you visit a
								website. Cookies are widely used by website owners in order to make their websites work, or to work
								more efficiently, as well as to provide reporting information.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								Why do we use cookies?
							</h2>
							<p>
								We use first and third-party cookies for several reasons. Some cookies are required for technical
								reasons in order for our website to operate, and we refer to these as "essential" or "strictly
								necessary" cookies. Other cookies also enable us to track and target the interests of our users to
								enhance the experience on our website.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								How can I control cookies?
							</h2>
							<p>
								You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights
								by setting your preferences in your browser. You can set or amend your web browser controls to accept or
								refuse cookies. If you choose to reject cookies, you may still use our website though your access to
								some functionality and areas of our website may be restricted.
							</p>
						</section>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
