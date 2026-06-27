import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../components/common/Logo";
import SEOHead from '../components/SEOHead';

export default function NotFoundPage() {
	return (
		<div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
			<SEOHead title="Page Not Found" description="The page you're looking for doesn't exist." noIndex />
			{/* Ambient background effects */}
			<div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[180px] pointer-events-none" />
			<div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-600/5 rounded-full blur-[160px] pointer-events-none" />

			{/* Grid pattern overlay */}
			<div
				className="absolute inset-0 opacity-[0.03] pointer-events-none"
				style={{
					backgroundImage:
						"linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
					backgroundSize: "60px 60px",
				}}
			/>

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="relative z-10 flex flex-col items-center text-center max-w-lg">
				{/* Logo */}
				<Logo className="mb-10" />

				{/* Animated 404 */}
				<motion.h1
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
					className="text-[8rem] sm:text-[10rem] font-heading font-bold leading-none tracking-tight">
					<span className="text-gradient">4</span>
					<span className="text-white/10">0</span>
					<span className="text-gradient">4</span>
				</motion.h1>

				{/* Message */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}>
					<h2 className="text-xl sm:text-2xl font-heading font-semibold text-white mb-3">
						Page Not Found
					</h2>
					<p className="text-white/50 text-sm sm:text-base leading-relaxed mb-8 max-w-sm mx-auto">
						The page you're looking for doesn't exist or has been moved. Let's get you back on track.
					</p>
				</motion.div>

				{/* Action Buttons */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.45 }}
					className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
					<Link
						to="/"
						className="w-full sm:w-auto px-8 py-3 text-sm font-medium text-surface-950 bg-brand-500 hover:bg-brand-400 rounded-full transition-all hover:shadow-lg hover:shadow-brand-500/20 text-center">
						Back to Home
					</Link>
					<Link
						to="/dashboard"
						className="w-full sm:w-auto px-8 py-3 text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-full transition-all text-center">
						Go to Dashboard
					</Link>
				</motion.div>

				{/* Decorative divider */}
				<div className="mt-12 flex items-center gap-3">
					<div className="w-12 h-px bg-gradient-to-r from-transparent to-white/10" />
					<span className="text-white/20 text-xs tracking-widest uppercase">StakeX</span>
					<div className="w-12 h-px bg-gradient-to-l from-transparent to-white/10" />
				</div>
			</motion.div>
		</div>
	);
}
