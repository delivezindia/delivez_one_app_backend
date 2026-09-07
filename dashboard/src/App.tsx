import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { DashboardLayout } from './components/DashboardLayout';

const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const DeliveriesPage = lazy(() => import('./pages/DeliveriesPage'));
const DriversPage = lazy(() => import('./pages/DriversPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function PageLoader() {
  return (
    <div className="page-loader" aria-label="Loading page">
      <span />
      <span />
      <span />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        element={
          <Suspense fallback={<PageLoader />}>
            <DashboardLayout />
          </Suspense>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="deliveries" element={<DeliveriesPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
