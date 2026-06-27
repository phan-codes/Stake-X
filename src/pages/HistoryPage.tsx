import { useState, useEffect, useMemo } from "react";
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Calendar, Search, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { Database } from "../types/supabase";
import SEOHead from '../components/SEOHead';

type HistoryTab = "withdraw" | "deposit" | "investment";
const ITEMS_PER_PAGE = 10;
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export default function HistoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<HistoryTab>("withdraw");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      setIsLoading(true);
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setTransactions(data);
      setIsLoading(false);
    };
    fetchTransactions();
  }, [user]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((tx) => tx.type === activeTab);
    if (fromDate) {
      const from = new Date(fromDate); from.setHours(0, 0, 0, 0);
      filtered = filtered.filter((tx) => new Date(tx.created_at) >= from);
    }
    if (toDate) {
      const to = new Date(toDate); to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((tx) => new Date(tx.created_at) <= to);
    }
    return filtered;
  }, [transactions, activeTab, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [activeTab, fromDate, toDate]);

  const tabOptions = [
    { value: "withdraw" as HistoryTab, label: "Unstake History", icon: ArrowUpCircle },
    { value: "deposit" as HistoryTab, label: "Stake History", icon: ArrowDownCircle },
    { value: "investment" as HistoryTab, label: "Pool History", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <SEOHead title="Transaction History" description="View your past staking activity and protocol transaction records." path="/dashboard/history" noIndex />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">{tabOptions.find(t => t.value === activeTab)?.label.toUpperCase()}</h1>
        <p className="text-white/50 mt-1">View your past protocol activity.</p>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-surface-900/60 flex items-center gap-2">
          <Search className="h-4 w-4 text-brand-400" />
          <h2 className="text-xs font-bold tracking-widest uppercase text-white/50">Select History Type</h2>
        </div>
        <div className="p-4">
          <div className="flex gap-2 p-1 bg-surface-950 rounded-xl max-w-xl">
            {tabOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setActiveTab(opt.value)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors ${activeTab === opt.value ? 'bg-brand-500 text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              >
                <opt.icon size={16} /> <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-surface-900/60 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-brand-400" />
          <h2 className="text-xs font-bold tracking-widest uppercase text-white/50">Filters</h2>
        </div>
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-surface-950 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 [color-scheme:dark]" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-surface-950 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 [color-scheme:dark]" />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={() => { setFromDate(""); setToDate(""); }} className="px-4 py-2 border border-white/10 bg-surface-900 hover:bg-white/5 rounded-lg text-sm font-bold">Clear</button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/5 bg-surface-900/60">
                <th className="h-12 px-5 text-left text-xs font-bold uppercase tracking-widest text-white/50">Date</th>
                <th className="h-12 px-5 text-left text-xs font-bold uppercase tracking-widest text-white/50">{activeTab === 'investment' ? 'Pool' : 'Asset'}</th>
                <th className="h-12 px-5 text-left text-xs font-bold uppercase tracking-widest text-white/50">Amount</th>
                <th className="h-12 px-5 text-left text-xs font-bold uppercase tracking-widest text-white/50">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="h-32 text-center text-white/50">Loading...</td></tr>
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map(tx => (
                  <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-5 py-4">{new Date(tx.created_at).toLocaleString()}</td>
                    <td className="px-5 py-4 text-brand-400 font-bold">
                      {activeTab === 'investment' ? (tx.plan_name ?? "—") : tx.asset}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold">${Number(tx.amount).toLocaleString()}</td>
                    <td className="px-5 py-4 uppercase text-xs tracking-wider">{tx.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="h-32 text-center">
                    <FileText className="h-8 w-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/50">No records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length > 0 && (
          <div className="p-4 border-t border-white/5 bg-surface-900/40 flex justify-between items-center">
            <span className="text-xs text-white/50">Showing page {currentPage} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1 text-white/50 hover:text-white disabled:opacity-50"><ChevronLeft size={16}/></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1 text-white/50 hover:text-white disabled:opacity-50"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
