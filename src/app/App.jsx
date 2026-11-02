import { BrowserRouter, Route, Routes } from 'react-router-dom';

import NotFoundPage from './NotFoundPage.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';
import Layout from '@/components/Layout.jsx';
import { AuthProvider } from '@/features/auth/AuthContext.jsx';
import CatalogPage from '@/features/catalog/CatalogPage.jsx';
import DashboardPage from '@/features/dashboard/DashboardPage.jsx';
import LoginPage from '@/features/auth/LoginPage.jsx';
import RegisterPage from '@/features/auth/RegisterPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute allowedRoles={['owner']} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
