import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const AmlPolicyPage = lazy(() => import('./pages/AmlPolicyPage'));
const DepositPage = lazy(() => import('./pages/DepositPage'));
const WithdrawPage = lazy(() => import('./pages/WithdrawPage'));
const LoanPage = lazy(() => import('./pages/LoanPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const InvestmentsPage = lazy(() => import('./pages/InvestmentsPage'));
const InboxPage = lazy(() => import('./pages/InboxPage'));

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminWalletsPage = lazy(() => import('./pages/admin/AdminWalletsPage'));
const AdminDepositsPage = lazy(() => import('./pages/admin/AdminDepositsPage'));
const AdminInvestmentsPage = lazy(() => import('./pages/admin/AdminInvestmentsPage'));
const AdminWithdrawalsPage = lazy(() => import('./pages/admin/AdminWithdrawalsPage'));
const AdminKycPage = lazy(() => import('./pages/admin/AdminKycPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-surface-950 flex items-center justify-center">
    <Loader2 className="animate-spin text-brand-500" size={48} />
  </div>
);

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Keep hash navigation behavior in PublicLayout intact.
    if (location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/cookies" element={<CookiePolicyPage />} />
              <Route path="/aml" element={<AmlPolicyPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/deposit" element={<DepositPage />} />
                <Route path="/dashboard/investments" element={<InvestmentsPage />} />
                <Route path="/dashboard/loan" element={<LoanPage />} />
                <Route path="/dashboard/withdraw" element={<WithdrawPage />} />
                <Route path="/dashboard/history" element={<HistoryPage />} />
                <Route path="/dashboard/profile" element={<ProfilePage />} />
                <Route path="/dashboard/inbox" element={<InboxPage />} />
              </Route>

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="wallets" element={<AdminWalletsPage />} />
                <Route path="deposits" element={<AdminDepositsPage />} />
                <Route path="investments" element={<AdminInvestmentsPage />} />
                <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
                <Route path="kyc" element={<AdminKycPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
