import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Balance {
  id: string;
  user_id: string;
  asset: string;
  balance: number;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  asset: string;
  amount: number;
  status: string;
  created_at: string;
}

export function useDashboardData() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [pendingInvestments, setPendingInvestments] = useState(0);
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        // Fetch balances
        const { data: balData } = await supabase
          .from('balances')
          .select('*')
          .eq('user_id', user.id);
        if (balData) setBalances(balData as Balance[]);

        // Fetch transactions
        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (txData) {
          const txs = txData as Transaction[];
          setTransactions(txs);

          const deposits = txs
            .filter(t => t.type === 'deposit' && t.status === 'completed')
            .reduce((acc, t) => acc + Number(t.amount), 0);
          setTotalDeposits(deposits);

          // Count pending items for badges
          setPendingInvestments(txs.filter(t => t.type === 'investment' && t.status === 'pending').length);
          setPendingDeposits(txs.filter(t => t.type === 'deposit' && t.status === 'pending').length);
          setPendingWithdrawals(txs.filter(t => t.type === 'withdraw' && t.status === 'pending').length);
        }

        // Fetch active investments from user_investments table (NOT transactions)
        try {
          const { data: activeInvData, error: invError } = await (supabase as any)
            .from('user_investments')
            .select('amount')
            .eq('user_id', user.id)
            .eq('status', 'active');
          if (invError) {
            console.error('Error fetching active investments:', invError);
          } else if (activeInvData) {
            const total = activeInvData.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0);
            setTotalInvestments(total);
          }
        } catch (e) {
          console.error('Exception fetching active investments:', e);
        }
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();

    // Realtime subscription
    const channel = supabase
      .channel('dashboard_data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'balances', filter: `user_id=eq.${user.id}` }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_investments', filter: `user_id=eq.${user.id}` }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { balances, transactions, totalDeposits, totalInvestments, pendingInvestments, pendingDeposits, pendingWithdrawals, isLoading };
}

