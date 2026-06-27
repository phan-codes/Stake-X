import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { sendEmailNotification } from '../lib/email';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  signOut: async () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  // Guard against sending welcome email multiple times in the same session
  const welcomeEmailSending = useRef(false);

  const checkAdminStatus = async (userId: string) => {
    try {
      // Use RPC function to bypass RLS policies that cause 500 errors
      const { data, error } = await supabase.rpc('is_admin', { user_id: userId });

      if (!error && data !== null) {
        console.log("Admin check successful:", data);
        setIsAdmin(!!data);
      } else {
        console.error("Admin RPC check failed:", { error, data });
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Admin check threw exception:", err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    /**
     * Send welcome email ONLY after the user has confirmed their email.
     * We check email_confirmed_at to ensure the email is verified.
     * The welcomeEmailSending ref prevents duplicate sends from
     * getSession + onAuthStateChange both firing.
     */
    const checkAndSendWelcomeEmail = async (user: User) => {
      // Only send if email is confirmed AND we haven't already sent it
      const isEmailConfirmed = !!user.email_confirmed_at;
      const alreadySent = !!user.user_metadata?.welcome_email_sent;

      if (!isEmailConfirmed || alreadySent || welcomeEmailSending.current) {
        return;
      }

      welcomeEmailSending.current = true;
      try {
        await sendEmailNotification({
          to: user.email!,
          type: 'welcome',
          data: { name: user.user_metadata?.full_name || 'Valued Client' },
        });
        await supabase.auth.updateUser({
          data: { welcome_email_sent: true }
        });
      } catch (err) {
        console.error("Failed to send welcome email:", err);
        welcomeEmailSending.current = false;
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id).finally(() => setLoading(false));
        checkAndSendWelcomeEmail(session.user);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        checkAdminStatus(session.user.id).finally(() => setLoading(false));
        checkAndSendWelcomeEmail(session.user);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
