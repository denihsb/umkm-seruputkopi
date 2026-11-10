import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/useAuth.js';
import { useCart } from '@/features/cart/useCart.js';

export default function Layout() {
  const { profile, role, signOut, user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError('');

    try {
      await signOut();
      navigate('/');
    } catch (error) {
      setSignOutError(error.message || 'Gagal keluar. Coba lagi.');
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-primary/20 px-4 py-3">
        <Link className="text-xl font-bold text-primary" to="/">
          Seruput
        </Link>
        <div className="flex items-center gap-3">
          <Link
            aria-label={`Keranjang, ${itemCount} item`}
            className="relative flex min-h-11 min-w-11 items-center justify-center"
            to="/keranjang"
          >
            <span aria-hidden="true" className="text-xl">
              &#128722;
            </span>
            {itemCount > 0 && (
              <span className="absolute right-0 top-0 min-w-5 rounded-full bg-primary px-1 text-center text-xs text-white">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              {role === 'owner' && <Link to="/dashboard">Dashboard</Link>}
              <Link className="flex min-h-11 items-center" to="/akun">
                {profile?.full_name}
              </Link>
              <button disabled={isSigningOut} type="button" onClick={handleSignOut}>
                {isSigningOut ? 'Keluar...' : 'Keluar'}
              </button>
            </div>
          ) : (
            <Link to="/login">Masuk</Link>
          )}
        </div>
        {signOutError && <p role="alert">{signOutError}</p>}
      </header>
      <Outlet />
    </>
  );
}
