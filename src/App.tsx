import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import AmlPolicyPage from './pages/AmlPolicyPage';
import ProtectedRoute from './components/ProtectedRoute';
import DepositPage from './pages/DepositPage';
import WithdrawPage from './pages/WithdrawPage';
import LoanPage from './pages/LoanPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import InvestmentsPage from './pages/InvestmentsPage';
import InboxPage from './pages/InboxPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminWalletsPage from './pages/admin/AdminWalletsPage';
import AdminDepositsPage from './pages/admin/AdminDepositsPage';
import AdminInvestmentsPage from './pages/admin/AdminInvestmentsPage';
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage';
import AdminKycPage from './pages/admin/AdminKycPage';
import NotFoundPage from './pages/NotFoundPage';

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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
