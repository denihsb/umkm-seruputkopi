import { Link, Outlet } from 'react-router-dom';

import { useAuth } from '@/features/auth/useAuth.js';

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="flex items-center justify-between border-b border-primary/20 px-4 py-3">
        <Link className="text-xl font-bold text-primary" to="/">
          Seruput
        </Link>
        {user ? (
          <button type="button" onClick={signOut}>
            Keluar
          </button>
        ) : (
          <Link to="/login">Masuk</Link>
        )}
      </header>
      <Outlet />
    </>
  );
}
