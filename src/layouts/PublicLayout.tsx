import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, MapPin, ChevronRight, Globe, Shield } from "lucide-react";
import Logo from "../components/common/Logo";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

function MobileMenuIcon({ open }: { open: boolean }) {
	return (
		<div className="flex flex-col justify-center items-center w-6 h-6 gap-1.5 cursor-pointer">
			<motion.span
				animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
				className="block w-6 h-0.5 bg-white origin-center"
			/>
			<motion.span animate={open ? { opacity: 0 } : { opacity: 1 }} className="block w-6 h-0.5 bg-white" />
			<motion.span
				animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
				className="block w-6 h-0.5 bg-white origin-center"
			/>
		</div>
	);
}

export default function PublicLayout() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const location = useLocation();
	const { user } = useAuth();
	const navigate = useNavigate();

	const navLinks = [
		{ id: "about", label: "About Us" },
		{ id: "how-it-works", label: "How It Works" },
		{ id: "investment-plans", label: "Staking Pools" },
		{ id: "nfp-loan", label: "Borrow" },
		{ id: "partners", label: "Supported Assets" },
		{ id: "faq", label: "FAQ" },
	] as const;

	useEffect(() => {
		if (!location.hash) return;
		const sectionId = location.hash.replace("#", "");

		// Wait for routed content to render before measuring position.
		requestAnimationFrame(() => {
			const sectionEl = document.getElementById(sectionId);
			if (!sectionEl) return;
			const headerOffset = 80;
			const top = sectionEl.getBoundingClientRect().top + window.scrollY - headerOffset;
			window.scrollTo({ top, behavior: "smooth" });
		});
	}, [location.pathname, location.hash]);

	const handleNavClick = (sectionId: string) => {
		setMobileMenuOpen(false);
		if (location.pathname !== "/") {
			navigate(`/#${sectionId}`);
			return;
		}

		const sectionEl = document.getElementById(sectionId);
		if (!sectionEl) return;
		const headerOffset = 80;
		const top = sectionEl.getBoundingClientRect().top + window.scrollY - headerOffset;
		window.scrollTo({ top, behavior: "smooth" });
		navigate({ hash: `#${sectionId}` }, { replace: true });
	};

	return (
		<div className="min-h-screen flex flex-col relative z-0">
			{/* Header */}
			<header className="border-b border-white/5 bg-surface-900/50 backdrop-blur-md sticky top-0 z-50">
				<div className="container mx-auto px-3 md:px-4 lg:px-2 h-16 flex items-center justify-between">
					<Logo />

					<nav className="hidden lg:flex gap-5 items-center flex-1 justify-center overflow-x-auto whitespace-nowrap px-4">
						{navLinks.map((link) => (
							<button
								key={link.id}
								onClick={() => handleNavClick(link.id)}
								className="text-sm font-medium text-white/70 hover:text-white transition-colors">
								{link.label}
							</button>
						))}
					</nav>

					<div className="flex items-center gap-4">
						<LanguageSwitcher />
						{user ? (
							<Link
								to="/dashboard"
								className="hidden md:inline-block px-5 py-2 text-sm font-medium text-surface-950 bg-brand-500 hover:bg-brand-400 rounded-full transition-all">
								Dashboard
							</Link>
						) : (
							<>
								<Link
									to="/login"
									className="hidden md:inline-block text-sm font-medium text-white hover:text-brand-400 transition-colors">
									Log in
								</Link>
								<Link
									to="/register"
									className="hidden md:inline-block px-5 py-2 text-sm font-medium text-surface-950 bg-brand-500 hover:bg-brand-400 rounded-full transition-all">
									Get Started
								</Link>
							</>
						)}
						<button
							className="lg:hidden p-2"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label="Toggle menu">
							<MobileMenuIcon open={mobileMenuOpen} />
						</button>
					</div>
				</div>

				<AnimatePresence>
					{mobileMenuOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="lg:hidden border-t border-white/5 overflow-hidden bg-surface-900/95 backdrop-blur-lg">
							<div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3">
								{navLinks.map((link) => (
									<button
										key={link.id}
										onClick={() => handleNavClick(link.id)}
										className="text-sm font-medium text-white/70 hover:text-white py-2 text-left">
										{link.label}
									</button>
								))}
								<div className="border-t border-white/5 pt-3 flex flex-col gap-3">
									<div className="py-1">
										<LanguageSwitcher />
									</div>
									{user ? (
										<Link
											to="/dashboard"
											onClick={() => setMobileMenuOpen(false)}
											className="px-5 py-2.5 text-sm font-medium text-surface-950 bg-brand-500 hover:bg-brand-400 rounded-full transition-all text-center">
											Dashboard
										</Link>
									) : (
										<>
											<Link
												to="/login"
												onClick={() => setMobileMenuOpen(false)}
												className="text-sm font-medium text-white hover:text-brand-400 py-2">
												Log in
											</Link>
											<Link
												to="/register"
												onClick={() => setMobileMenuOpen(false)}
												className="px-5 py-2.5 text-sm font-medium text-surface-950 bg-brand-500 hover:bg-brand-400 rounded-full transition-all text-center">
												Get Started
											</Link>
										</>
									)}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</header>

			<main className="flex-1 flex flex-col relative w-full pt-0">
				<Outlet />
			</main>

			{/* ─── FOOTER ─── */}
			<footer className="bg-surface-900 border-t border-white/5 relative overflow-hidden">
				<div className="absolute top-0 left-1/3 w-96 h-96 bg-brand-500/3 rounded-full blur-[200px] pointer-events-none"></div>

				<div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
						{/* Brand */}
						<div className="md:col-span-2 lg:col-span-1">
							<Logo className="mb-5" />
							<p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
								A premier decentralized staking and DeFi services protocol. Empowering users
								worldwide with institutional-grade blockchain infrastructure since 2020.
							</p>
							<div className="flex items-center gap-3">
								<a
									href="mailto:support@stakex.finance"
									className="flex items-center gap-2 text-white/50 hover:text-brand-400 transition-colors">
									<Mail size={16} />
									<span className="text-sm">support@stakex.finance</span>
								</a>
							</div>
						</div>

						{/* Quick Links */}
						<div>
							<h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Quick Links</h4>
							<ul className="space-y-3">
								{[
									{ label: "Home", to: "/" },
									{ label: "About Us", to: "/#about" },
									{ label: "How it Works", to: "/#how-it-works" },
									{ label: "Staking Pools", to: "/#investment-plans" },
									...(user
										? [{ label: "Dashboard", to: "/dashboard" }]
										: [
											{ label: "Login", to: "/login" },
											{ label: "Register", to: "/register" },
										]),
								].map((link, i) => (
									<li key={i}>
										<Link
											to={link.to}
											className="text-white/50 text-sm hover:text-brand-400 transition-colors flex items-center gap-1.5 group">
											<ChevronRight size={12} className="text-white/20 group-hover:text-brand-400 transition-colors" />
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Services */}
						<div>
							<h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Our Services</h4>
							<ul className="space-y-3">
								{[
									"DeFi Staking",
									"Liquidity Pools",
									"Yield Farming",
									"Crypto Borrowing",
									"Asset Management",
									"Secure Vaults",
									"Multi-Chain Support",
								].map((service, i) => (
									<li key={i}>
										<span className="text-white/50 text-sm flex items-center gap-1.5">
											<ChevronRight size={12} className="text-white/20" />
											{service}
										</span>
									</li>
								))}
							</ul>
						</div>

						{/* Contact */}
						<div>
							<h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Contact Us</h4>
							<ul className="space-y-4">
								<li className="flex items-start gap-3">
									<MapPin size={16} className="text-brand-400 mt-0.5 shrink-0" />
									<span className="text-white/50 text-sm leading-relaxed">
										71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom
									</span>
								</li>
								<li className="flex items-center gap-3">
									<Mail size={16} className="text-brand-400 shrink-0" />
									<a
										href="mailto:support@stakex.finance"
										className="text-white/50 text-sm hover:text-brand-400 transition-colors">
										support@stakex.finance
									</a>
								</li>
								<li className="flex items-center gap-3">
									<Globe size={16} className="text-brand-400 shrink-0" />
									<span className="text-white/50 text-sm">24/7 Live Support</span>
								</li>
							</ul>
							<div className="flex items-center gap-3 mt-6">
								<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
									<Shield size={12} className="text-emerald-400" />
									<span className="text-emerald-400 text-xs font-medium">SSL Secured</span>
								</div>
								<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
									<Shield size={12} className="text-cyan-400" />
									<span className="text-cyan-400 text-xs font-medium">Verified</span>
								</div>
							</div>
						</div>
					</div>

					{/* Bottom */}
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<p className="text-white/40 text-xs text-center md:text-left">
							&copy; {new Date().getFullYear()} StakeX Protocol. All rights reserved.
						</p>
						<div className="grid grid-cols-2 place-items-center md:flex md:items-center gap-y-3 gap-x-4 md:gap-6 w-full md:w-auto mt-2 md:mt-0">
							<Link to="/terms" className="text-white/40 text-xs hover:text-white/70 transition-colors">
								Terms of Service
							</Link>
							<Link to="/privacy" className="text-white/40 text-xs hover:text-white/70 transition-colors">
								Privacy Policy
							</Link>
							<Link to="/cookies" className="text-white/40 text-xs hover:text-white/70 transition-colors">
								Cookie Policy
							</Link>
							<Link to="/aml" className="text-white/40 text-xs hover:text-white/70 transition-colors">
								AML Policy
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
