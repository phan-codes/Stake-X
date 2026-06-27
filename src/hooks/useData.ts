import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/supabase';

type Transaction = Database['public']['Tables']['transactions']['Row'];

export function useTransactions() {
  const { session } = useAuth();
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    

    const fetchTransactions = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setData(data);
      setLoading(false);
    };

    fetchTransactions();

    const sub = supabase
      .channel('transactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${session.user.id}` }, () => {
        // Trigger refetch
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [session]);

  return { data, loading };
}
