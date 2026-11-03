import { Link, Outlet } from 'react-router-dom';

import { useAuth } from '@/features/auth/useAuth.js';

export default function Layout() {
  const { profile, role, signOut, user } = useAuth();

  return (
    <>
      <header className="flex items-center justify-between border-b border-primary/20 px-4 py-3">
        <Link className="text-xl font-bold text-primary" to="/">
          Seruput
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            {role === 'owner' && <Link to="/dashboard">Dashboard</Link>}
            <span>{profile?.full_name}</span>
            <button type="button" onClick={signOut}>
              Keluar
            </button>
          </div>
        ) : (
          <Link to="/login">Masuk</Link>
        )}
      </header>
      <Outlet />
    </>
  );
}
