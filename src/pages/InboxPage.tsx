import { useState, useEffect } from "react";
import { User, Mail, Download, CheckCircle2, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import SEOHead from '../components/SEOHead';

type Notification = {
  id: string;
  user_id: string;
  sender_name: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function InboxPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setIsLoading(true);
      const { data } = await (supabase as any)
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setNotifications(data as Notification[]);
      }
      setIsLoading(false);
    };

    fetchNotifications();

    const channel = supabase
      .channel("notifications_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        fetchNotifications
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleViewNotification = async (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.is_read) {
      await (supabase as any).from("notifications").update({ is_read: true }).eq("id", notification.id);
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <SEOHead title="Inbox" description="View your protocol messages and notifications." path="/dashboard/inbox" noIndex />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-white">Inbox</h1>
        <p className="text-white/60 mt-2 text-sm sm:text-base">
          View your recent protocol messages and notifications.
          {unreadCount > 0 && <span className="text-brand-400 font-bold ml-1">({unreadCount} unread)</span>}
        </p>
        <div className="bg-surface-950 p-4 rounded-xl border border-white/5 mt-4 text-xs text-white/50 leading-relaxed">
          Our protocol systems automatically generate these notifications to deliver important,
          personalized updates about your staking positions and rewards. You cannot respond because these are automated protocol alerts.
          If you need assistance, please contact support.
          <br /><br />
          All communications are securely transmitted using end-to-end encryption.
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-xl">
            <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mb-4" />
            <p className="text-sm text-white/50 font-medium">Loading messages...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3 inbox-message-list">
            {notifications.map((msg) => (
              <div
                key={msg.id}
                className={`inbox-message-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border transition-all ${
                  msg.is_read ? "bg-surface-900/40 border-white/5" : "bg-brand-500/10 border-brand-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                }`}
              >
                <div className="inbox-message-main flex items-start sm:items-center gap-4 sm:gap-6 flex-1">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full shrink-0 ${
                    msg.is_read ? "bg-white/5 text-white/40" : "bg-brand-500 text-surface-900"
                  }`}>
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold ${msg.is_read ? 'text-white/80' : 'text-white'}`}>{msg.sender_name}</h3>
                    <p className={`text-sm truncate ${msg.is_read ? 'text-white/50' : 'text-white/80 font-medium'}`}>{msg.title}</p>
                  </div>
                </div>
                <div className="inbox-message-actions flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-white/5">
                  <span className="inbox-message-meta text-xs text-white/40 font-medium">
                    {new Date(msg.created_at).toLocaleString(undefined, {
                      month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                    })}
                  </span>
                  <div className="flex items-center gap-3">
                    {!msg.is_read && <div className="h-2 w-2 rounded-full bg-brand-500" />}
                    <button onClick={() => handleViewNotification(msg)} className="inbox-message-view-btn flex items-center gap-2 px-4 py-2 bg-surface-800 hover:bg-surface-700 text-white text-sm font-bold rounded-lg transition-colors border border-white/5">
                      <Download size={14} /> View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-xl">
            <div className="p-4 rounded-full bg-surface-800 mb-4 text-white/40">
              <Mail size={32} />
            </div>
            <p className="text-lg font-bold text-white mb-1">Your inbox is empty</p>
            <p className="text-sm text-white/50">Check back later for new messages.</p>
          </div>
        )}
      </div>

      {selectedNotification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-white/5 bg-surface-900/60 flex items-start gap-4 shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 shrink-0">
                <User size={24} />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-xl font-bold text-white leading-tight">{selectedNotification.title}</h2>
                <p className="text-xs text-brand-400 font-medium mt-1">
                  From: {selectedNotification.sender_name} <span className="text-white/30 mx-1">•</span> {new Date(selectedNotification.created_at).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedNotification(null)} className="text-white/50 hover:text-white shrink-0 bg-white/5 p-2 rounded-full transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {selectedNotification.message}
              </p>
            </div>
            <div className="p-4 bg-surface-900/60 border-t border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={14} /> Read
              </div>
              <button onClick={() => setSelectedNotification(null)} className="px-6 py-2 bg-surface-800 hover:bg-surface-700 text-white font-bold rounded-xl transition-colors border border-white/5">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
