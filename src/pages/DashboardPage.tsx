import { useMemo, useState } from "react";
import {
	Wallet,
	ArrowUpFromLine,
	TrendingUp,
	Layers,
	Gift,
	Activity,
	ChevronLeft,
	ChevronRight,
	Loader2,
} from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SEOHead from '../components/SEOHead';

function StatCard({
	title,
	value,
	icon,
	iconBg,
}: {
	title: string;
	value: string;
	icon: React.ReactNode;
	iconBg: string;
}) {
	return (
		<div className="glass-panel rounded-xl p-5 relative overflow-hidden group">
			<div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-8 -mt-8 opacity-20 bg-brand-500 group-hover:opacity-30 transition-all" />
			<div className="flex items-center justify-between mb-3">
				<p className="text-xs font-bold uppercase tracking-widest text-white/50">{title}</p>
				<div className={`p-2 rounded-full ${iconBg}`}>{icon}</div>
			</div>
			<p className="text-2xl font-bold font-mono tracking-tight text-white">{value}</p>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const map: Record<string, string> = {
		completed: "bg-emerald-500/15 text-emerald-400",
		pending: "bg-brand-500/15 text-brand-400",
		failed: "bg-red-500/15 text-red-400",
		active: "bg-sky-500/15 text-sky-400",
	};
	return (
		<span
			className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status] ?? "bg-white/10 text-white/50"}`}>
			<span className="w-1.5 h-1.5 rounded-full bg-current" />
			{status}
		</span>
	);
}

const ITEMS_PER_PAGE = 8;

export default function DashboardPage() {
	const { balances, transactions, totalDeposits, totalInvestments, isLoading, pendingWithdrawals } = useDashboardData();
	const [currentPage, setCurrentPage] = useState(1);

	const totalBalance = balances.reduce((acc, curr) => acc + Number(curr.balance), 0);

	const totalEarned = transactions
		.filter((t) => t.type === "earn" && t.status === "completed")
		.reduce((acc, curr) => acc + Number(curr.amount), 0);

	const totalPages = Math.max(1, Math.ceil(transactions.length / ITEMS_PER_PAGE));
	const paginatedTransactions = transactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

	const chartData = useMemo(() => {
		const today = new Date();
		today.setHours(23, 59, 59, 999);
		let currentBal = totalBalance;
		
		const data = [];
		for (let i = 0; i < 7; i++) {
			const d = new Date(today);
			d.setDate(today.getDate() - i);
			
			data.push({
				name: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
				value: currentBal,
			});

			const startOfDay = new Date(d);
			startOfDay.setHours(0, 0, 0, 0);

			const txsThisDay = transactions.filter(t => {
				const td = new Date(t.created_at);
				return td >= startOfDay && td <= d;
			});

			txsThisDay.forEach(t => {
				if (t.status === 'completed' || t.status === 'active') {
					const amount = Number(t.amount);
					if (t.type === 'deposit' || t.type === 'earn') {
						currentBal -= amount;
					} else if (t.type === 'withdraw' || t.type === 'investment') {
						currentBal += amount;
					}
				}
			});
			
			if (currentBal < 0) currentBal = 0;
		}

		return data.reverse();
	}, [totalBalance, transactions]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-brand-400" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<SEOHead title="Dashboard" description="Your StakeX investment dashboard." path="/dashboard" noIndex />
			{/* Header */}
			<div>
				<h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">Dashboard</h1>
				<p className="text-white/50 mt-1 text-sm">A glance summary of your investment account.</p>
			</div>

			{/* Stat Cards */}
			<div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
				<StatCard
					title="Account Balance"
					value={`$${totalBalance.toLocaleString()}`}
					icon={<Wallet className="h-4 w-4 text-brand-400" />}
					iconBg="bg-brand-500/10"
				/>
				<StatCard
					title="Total Staked Assets"
					value={`$${totalDeposits.toLocaleString()}`}
					icon={<Layers className="h-4 w-4 text-sky-400" />}
					iconBg="bg-sky-500/10"
				/>
				<StatCard
					title="Rewards Earned"
					value={`$${totalEarned.toLocaleString()}`}
					icon={<Gift className="h-4 w-4 text-brand-400" />}
					iconBg="bg-brand-500/10"
				/>
				<StatCard
					title="Active Pools"
					value={`$${totalInvestments.toLocaleString()}`}
					icon={<TrendingUp className="h-4 w-4 text-purple-400" />}
					iconBg="bg-purple-500/10"
				/>
				<StatCard
					title="Pending Unstakes"
					value={`${pendingWithdrawals}`}
					icon={<ArrowUpFromLine className="h-4 w-4 text-emerald-400" />}
					iconBg="bg-emerald-500/10"
				/>
			</div>

			{/* Chart + Transactions */}
			<div className="grid gap-6 lg:grid-cols-7 border-t border-white/5 pt-6">
				{/* Area Chart */}
				<div className="glass-panel rounded-xl p-4 sm:p-6 lg:col-span-4 min-w-0">
					<h3 className="font-semibold font-heading text-lg mb-4">Portfolio Growth</h3>
					<div className="h-[280px] overflow-x-auto">
						<div className="min-w-[480px] h-full">
							<ResponsiveContainer width="100%" height="100%" minWidth={0}>
								<AreaChart data={chartData}>
									<defs>
										<linearGradient id="pxblGrad" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
											<stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
										</linearGradient>
									</defs>
									<XAxis dataKey="name" stroke="#ffffff30" fontSize={11} tickLine={false} axisLine={false} />
									<YAxis
										stroke="#ffffff30"
										fontSize={11}
										tickLine={false}
										axisLine={false}
										tickFormatter={(v) => `$${v}`}
									/>
									<Tooltip
										contentStyle={{ backgroundColor: "#121212", borderColor: "#ffffff10", borderRadius: "10px" }}
										itemStyle={{ color: "#a78bfa" }}
										formatter={(value) => {
											const num = typeof value === "number" ? value : Number(value ?? 0);
											return [`$${num.toLocaleString()}`, "Balance"] as const;
										}}
									/>
									<Area
										type="monotone"
										dataKey="value"
										stroke="#8b5cf6"
										strokeWidth={2.5}
										fillOpacity={1}
										fill="url(#pxblGrad)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				{/* Transaction Log */}
				<div className="glass-panel rounded-xl lg:col-span-3 flex flex-col min-w-0 max-h-[420px]">
					<div className="p-4 sm:p-5 border-b border-white/5 shrink-0">
						<h3 className="font-semibold font-heading text-lg">Transaction History</h3>
					</div>

					{transactions.length === 0 ? (
						<div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
							<Activity className="h-10 w-10 text-white/20 mb-3" />
							<p className="text-sm text-white/40">No transactions yet.</p>
						</div>
					) : (
						<>
							<div className="flex-1 overflow-y-auto">
								<table className="w-full text-sm whitespace-nowrap">
									<thead>
										<tr className="border-b border-white/5 bg-surface-900/60">
											<th className="h-10 px-4 text-left text-[10px] font-bold uppercase tracking-wider text-white/40">
												Type
											</th>
											<th className="h-10 px-4 text-left text-[10px] font-bold uppercase tracking-wider text-white/40">
												Amount
											</th>
											<th className="h-10 px-4 text-left text-[10px] font-bold uppercase tracking-wider text-white/40">
												Status
											</th>
											<th className="h-10 px-4 text-left text-[10px] font-bold uppercase tracking-wider text-white/40">
												Date
											</th>
										</tr>
									</thead>
									<tbody>
										{paginatedTransactions.map((t) => (
											<tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
												<td className="px-4 py-3 font-medium capitalize text-white/80">{t.type}</td>
												<td className="px-4 py-3 font-mono font-bold text-white">
													${Number(t.amount).toLocaleString()}
												</td>
												<td className="px-4 py-3">
													<StatusBadge status={t.status} />
												</td>
												<td className="px-4 py-3 text-xs text-white/50">
													{new Date(t.created_at).toLocaleString(undefined, {
														year: 'numeric',
														month: 'short',
														day: 'numeric',
														hour: 'numeric',
														minute: '2-digit',
														hour12: true
													})}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							<div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-surface-900/40 shrink-0">
								<p className="text-xs text-white/40">
									{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)}{" "}
									of {transactions.length}
								</p>
								<div className="flex items-center gap-1">
									<button
										disabled={currentPage === 1}
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
										className="h-7 w-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors">
										<ChevronLeft className="h-4 w-4" />
									</button>
									{Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((page) => (
										<button
											key={page}
											onClick={() => setCurrentPage(page)}
											className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors ${page === currentPage ? "bg-brand-500/20 text-brand-400" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
											{page}
										</button>
									))}
									<button
										disabled={currentPage === totalPages}
										onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
										className="h-7 w-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors">
										<ChevronRight className="h-4 w-4" />
									</button>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
