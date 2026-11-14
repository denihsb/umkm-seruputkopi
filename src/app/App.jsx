import { BrowserRouter, Route, Routes } from 'react-router-dom';

import NotFoundPage from './NotFoundPage.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';
import Layout from '@/components/Layout.jsx';
import UpdatePrompt from '@/components/UpdatePrompt.jsx';
import { AuthProvider } from '@/features/auth/AuthContext.jsx';
import AccountPage from '@/features/account/AccountPage.jsx';
import { CartProvider } from '@/features/cart/CartContext.jsx';
import CartPage from '@/features/cart/CartPage.jsx';
import CatalogPage from '@/features/catalog/CatalogPage.jsx';
import MenuDetailPage from '@/features/catalog/MenuDetailPage.jsx';
import DashboardPage from '@/features/dashboard/DashboardPage.jsx';
import DashboardOrderPlaceholder from '@/features/dashboard/DashboardOrderPlaceholder.jsx';
import LoginPage from '@/features/auth/LoginPage.jsx';
import RegisterPage from '@/features/auth/RegisterPage.jsx';
import CheckoutPage from '@/features/checkout/CheckoutPage.jsx';
import ConfirmationPlaceholder from '@/features/checkout/ConfirmationPlaceholder.jsx';
import PaymentPage from '@/features/checkout/PaymentPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/menu/:id" element={<MenuDetailPage />} />
                <Route path="/keranjang" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/akun" element={<AccountPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/checkout/pembayaran" element={<PaymentPage />} />
                  <Route path="/pesanan/:id" element={<ConfirmationPlaceholder />} />
                  <Route element={<RoleRoute allowedRoles={['owner']} />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/dashboard/pesanan/:id" element={<DashboardOrderPlaceholder />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
            <UpdatePrompt />
          </>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
