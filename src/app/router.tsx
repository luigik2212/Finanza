import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "../pages/Login";
import { DashboardPage } from "../pages/Dashboard";
import { TransactionsPage } from "../pages/Transactions";
import { CategoriesPage } from "../pages/Categories";
import { MerchantsPage } from "../pages/Merchants";
import { ReportsPage } from "../pages/Reports";
import { SettingsPage } from "../pages/Settings";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="merchants" element={<MerchantsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
