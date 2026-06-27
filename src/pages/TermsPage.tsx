import { useEffect } from "react";
import { motion } from "framer-motion";
import SEOHead from '../components/SEOHead';

export default function TermsPage() {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<div className="min-h-screen bg-surface-950 pt-24 pb-20 relative overflow-hidden">
			<SEOHead
				title="Terms of Service"
				description="Read the Terms of Service for StakeX. Understand the rules, obligations, and conditions governing your use of our crypto investment platform."
				path="/terms"
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
							Terms of <span className="text-brand-500">Service</span>
						</h1>
						<p className="text-white/50 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
					</div>

					{/* Content */}
					<div className="prose prose-invert prose-brand max-w-none text-white/70 space-y-8 leading-relaxed">
						<section className="bg-surface-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm">
							<p>
								This website and any mobile application (collectively, this “Site”) is owned by{" "}
								<span className="text-white font-semibold">StakeX</span> (“We”, “Us” or “StakeX”). We are
								providing you with access to this Site and our online platform (together, our “Services”) subject to the
								following terms and conditions.
							</p>
							<p className="mt-4">
								By browsing, accessing, using, registering for or utilizing services on this Site or otherwise using
								our Services, you are agreeing to all of the following terms and conditions, including any policies
								referred to herein (collectively, these “Terms”). So, please read these Terms carefully. We reserve
								the right to change this Site and these Terms at any time. If you are unwilling to be bound by these
								Terms, you should not browse, access, use, register for or utilize services from the Site.
							</p>
							<p className="mt-4">
								You represent and warrant that you are at least 18 years old or visiting this Site under the
								supervision of a parent or guardian.
							</p>
							<p className="mt-4 text-rose-400 font-medium">
								We currently do not provide services or sell products to under-aged users.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								Privacy Policy
							</h2>
							<p>
								Our Privacy Policy, which also governs your visit to Our Site, can be found on this platform. Please
								review our Privacy Policy for information on how We collect, use and share information about our
								users.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								Use of This Site
							</h2>
							<p>
								Subject to your compliance with these Terms, We grant you a limited, non-exclusive, non-transferable,
								non-sub licensable license to access and make personal, non-commercial use of this Site. This license
								grant does not include: (a) any resale or commercial use of this Site or content therein; (b) the
								collection and use of any product listings or descriptions; (c) making derivative uses of this Site
								and its contents; or (d) use of any data mining, robots, or similar data gathering and extraction
								methods on this Site.
							</p>
							<p>
								You may not use, frame or utilize framing techniques to enclose any of Our trademark, logo, content or
								other proprietary information (including the images found at this Site, the content of any text or the
								layout/design of any page or form contained on a page) without Our express written consent. Further,
								you may not use any meta tags or any other “hidden text” utilizing Our name, trademark, or product
								name without Our express written consent. Any breach of these Terms shall result in the immediate
								revocation of the license granted in this paragraph without notice to you.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								Account
							</h2>
							<p>
								In order to access some features of this Site, you may be required to register and We may assign to
								you, or you may be required to select, a password and user name or account identification. If you
								register, you agree to provide Us with accurate and complete registration information, and to inform
								us immediately of any updates or other changes to such information.
							</p>
							<p>
								You are solely responsible for protecting the security and confidentiality of the password and
								identification assigned to you. You shall immediately notify Us of any unauthorized use of your
								password or identification or any other breach or threatened breach of this Site's security.
							</p>
							<div className="bg-brand-500/10 border border-brand-500/20 p-5 rounded-xl text-brand-100 text-sm">
								YOU WILL BE SOLELY RESPONSIBLE FOR ALL ACCESS TO AND USE OF THIS SITE BY ANYONE USING THE PASSWORD AND
								IDENTIFICATION ORIGINALLY SELECTED BY, OR ASSIGNED TO, YOU WHETHER OR NOT SUCH ACCESS TO AND USE OF
								THIS SITE IS ACTUALLY AUTHORIZED BY YOU.
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								Electronic Communication
							</h2>
							<p>
								When you use this Site, or send emails to Us, you are communicating with Us electronically. You
								consent to receive communications from Us electronically. We will communicate with you by e-mail or by
								posting notices on this Site or through our other services. You agree that all agreements, notices,
								disclosures and other communication that We provide to you electronically satisfy any legal
								requirements that such communications be in writing.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="text-xl font-heading font-bold text-white border-l-2 border-brand-500 pl-4">
								User Content
							</h2>
							<p>
								This Site may include features and functionality (“Interactive Features”) that allows users to create,
								post, transmit or store any content, such as text, music, sound, photos, video, graphics or code on the
								Sites ("User Content"). You agree that you are solely responsible for your User Content and for your
								use of Interactive Features, and that your use any Interactive Features at your own risk.
							</p>
							<p>By using any Interactive Areas, you agree not to post, upload to, transmit, or distribute:</p>
							<ul className="list-disc list-inside space-y-2 ml-4 text-white/60">
								<li>User Content that is unlawful, libelous, defamatory, or obscene.</li>
								<li>User Content that would constitute or encourage a criminal offense.</li>
								<li>User Content that may violate the publicity, privacy or data protection rights of others.</li>
								<li>
									User Content that impersonates any person or entity or misrepresents your affiliation with a person
									or entity.
								</li>
								<li>Viruses, malware, corrupted data or other destructive files.</li>
							</ul>
						</section>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
