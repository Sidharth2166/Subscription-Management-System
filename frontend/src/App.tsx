import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SplashScreen } from './components/splash/SplashScreen';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { AppShell } from './components/shell/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPlansPage } from './pages/ProductsPlansPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { RevenueRescuePage } from './pages/RevenueRescuePage';
import { CopilotPage } from './pages/CopilotPage';
import { NotificationCentrePage } from './pages/NotificationCentrePage';
import { SettingsPage } from './pages/SettingsPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';

function LandingWithSplash() {
  return (
    <>
      <SplashScreen onComplete={() => {}} />
      <LandingPage />
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing & Auth */}
          <Route path="/" element={<LandingWithSplash />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/design" element={<DesignSystemPage />} />

          {/* Authenticated App Shell (Admin, Staff, Customer) */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/products" element={<ProductsPlansPage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/rescue" element={<RevenueRescuePage />} />
            <Route path="/copilot" element={<CopilotPage />} />
            <Route path="/notifications" element={<NotificationCentrePage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Customer Portal */}
            <Route path="/portal" element={<CustomerPortalPage />} />
            <Route path="/portal/subscriptions" element={<CustomerPortalPage />} />
            <Route path="/portal/invoices" element={<InvoicesPage />} />
            <Route path="/portal/payments" element={<PaymentsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
