import { useEffect } from "react";
import { motion } from "framer-motion";
import SEOHead from '../components/SEOHead';

export default function PrivacyPage() {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<div className="min-h-screen bg-surface-950 pt-24 pb-20 relative overflow-hidden">
			<SEOHead
				title="Privacy Policy"
				description="Learn how StakeX collects, uses, and protects your personal data. Our privacy policy details our commitment to securing your information."
				path="/privacy"
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
							Privacy <span className="text-brand-500">Policy</span>
						</h1>
						<p className="text-white/50 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
					</div>

					{/* Content */}
					<div className="prose prose-invert prose-brand max-w-none text-white/70 space-y-8 leading-relaxed">
						<section className="bg-surface-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm">
							<p>
								At <span className="text-white font-semibold">StakeX</span>, we are committed to protecting your
								privacy and ensuring the security of your personal data. This Privacy Policy outlines how we collect,
								use, share, and protect your information when you access our Site and use our Services.
							</p>
							<p className="mt-4">
								By using StakeX services, you consent to the data practices described in this policy. If you do
								not agree with any part of this Privacy Policy, please discontinue your use of our platform
								immediately.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								1. Information We Collect
							</h2>
							<div className="space-y-4">
								<p>
									We collect several types of information to provide and improve our Services, including:
								</p>
								<ul className="list-disc list-inside space-y-2 ml-4 text-white/60">
									<li>
										<span className="text-white font-medium">Personal Identifiers:</span> Name, email address,
										phone number, and government-issued identification for KYC/AML compliance.
									</li>
									<li>
										<span className="text-white font-medium">Financial Information:</span> Wallet addresses,
										transaction history on our platform, and investment preferences.
									</li>
									<li>
										<span className="text-white font-medium">Technical Data:</span> IP address, browser type,
										device information, and operating system used to access our Site.
									</li>
									<li>
										<span className="text-white font-medium">Usage Data:</span> Information on how you interact
										with our Site, including pages visited and time spent on the platform.
									</li>
								</ul>
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								2. How We Use Your Information
							</h2>
							<p>
								StakeX uses the collected data for various purposes:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4 text-white/60">
								<li>To provide, maintain, and improve our investment services.</li>
								<li>To verify your identity and prevent fraudulent activities.</li>
								<li>To process your transactions and manage your investment portfolios.</li>
								<li>To communicate with you about updates, security alerts, and promotional offers.</li>
								<li>To comply with legal obligations and regulatory requirements in the digital finance industry.</li>
								<li>To analyze usage patterns and optimize our user interface and experience.</li>
							</ul>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								3. Information Sharing and Disclosure
							</h2>
							<p>
								We do not sell your personal information to third parties. However, we may share your data in the
								following circumstances:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4 text-white/60">
								<li>
									<span className="text-white font-medium">Service Providers:</span> We may share data with trusted
									partners who assist us in operating our platform, such as payment processors and KYC verification
									services.
								</li>
								<li>
									<span className="text-white font-medium">Legal Compliance:</span> We may disclose information if
									required by law or in response to valid requests by public authorities.
								</li>
								<li>
									<span className="text-white font-medium">Business Transfers:</span> In the event of a merger,
									acquisition, or sale of assets, your data may be transferred as part of the transaction.
								</li>
							</ul>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								4. Data Security
							</h2>
							<p>
								The security of your data is of paramount importance to us. We implement industry-standard security
								measures, including:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4 text-white/60">
								<li>AES-256 encryption for sensitive data at rest and in transit.</li>
								<li>Multi-factor authentication (MFA) for all account access.</li>
								<li>Cold storage for the majority of digital assets to protect against online threats.</li>
								<li>Regular security audits and vulnerability assessments.</li>
							</ul>
							<div className="bg-brand-500/10 border border-brand-500/20 p-5 rounded-xl text-brand-100 text-sm mt-4">
								While we strive to use commercially acceptable means to protect your personal data, we cannot
								guarantee its absolute security. No method of transmission over the Internet or electronic storage is
								100% secure.
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								5. Cookies and Tracking Technologies
							</h2>
							<p>
								We use cookies and similar tracking technologies to track activity on our platform and hold certain
								information. Cookies are files with small amounts of data which may include an anonymous unique
								identifier.
							</p>
							<p>
								You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However,
								if you do not accept cookies, you may not be able to use some portions of our Service.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								6. Your Rights and Choices
							</h2>
							<p>
								Depending on your jurisdiction, you may have the following rights regarding your personal data:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4 text-white/60">
								<li>The right to access and receive a copy of your personal data.</li>
								<li>The right to rectify any inaccurate or incomplete information.</li>
								<li>The right to request the deletion of your data under certain conditions.</li>
								<li>The right to object to or restrict the processing of your personal information.</li>
								<li>The right to data portability.</li>
							</ul>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								7. Children's Privacy
							</h2>
							<p>
								Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect
								personally identifiable information from anyone under the age of 18. If you are a parent or guardian
								and you are aware that your child has provided us with personal data, please contact us.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								8. Changes to This Policy
							</h2>
							<p>
								We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
								new Privacy Policy on this page and updating the "Last updated" date at the top of this policy.
							</p>
							<p>
								You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy
								Policy are effective when they are posted on this page.
							</p>
						</section>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
