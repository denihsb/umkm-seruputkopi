import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/features/auth/useAuth.js';

export default function RoleRoute({ allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <p>Memuat...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
