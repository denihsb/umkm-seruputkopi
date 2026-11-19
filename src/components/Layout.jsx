import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/useAuth.js';
import { useCart } from '@/features/cart/useCart.js';

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
      </>
    ),
    receipt: (
      <>
        <path d="M5 3h14v18l-3-2-4 2-4-2-3 2z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 1.9-1.4L22 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5M4 19h17" />
        <path d="m7 15 4-4 3 2 6-7" />
      </>
    ),
  };
  return <svg {...common}>{paths[name] ?? paths.home}</svg>;
}

export default function Layout() {
  const { profile, role, signOut, user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const isAdminArea = role === 'owner' && location.pathname.startsWith('/dashboard');

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

  if (isAdminArea) {
    const adminLinks = [
      { to: '/dashboard', label: 'Dashboard', icon: 'home', end: true },
      { to: '/dashboard/transaksi', label: 'Transaksi', icon: 'receipt' },
      { to: '/dashboard/menu', label: 'Menu', icon: 'menu' },
    ];
    return (
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <Link className="admin-brand" to="/dashboard" aria-label="Seruput Admin">
            <span className="brand-mark">S</span>
            <span>
              <strong>Seruput</strong>
              <small>OWNER SPACE</small>
            </span>
          </Link>
          <div className="sidebar-caption">WORKSPACE</div>
          <nav aria-label="Navigasi admin" className="admin-nav">
            {adminLinks.map((item) => (
              <NavLink
                className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
                end={item.end}
                key={item.to}
                to={item.to}
              >
                <Icon name={item.icon} /> <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <Link className="admin-nav-link" to="/" title="Lihat halaman pelanggan">
              <Icon name="home" />
              <span>Halaman pelanggan</span>
            </Link>
            <button
              className="admin-nav-link logout-link"
              disabled={isSigningOut}
              onClick={handleSignOut}
              type="button"
            >
              <Icon name="logout" />
              <span>{isSigningOut ? 'Keluar...' : 'Keluar akun'}</span>
            </button>
          </div>
        </aside>
        <div className="admin-workspace">
          <header className="admin-topbar">
            <div>
              <span className="topbar-eyebrow">SERUPUT KOPI · MEDAN</span>
              <strong>Panel Pemilik</strong>
            </div>
            <div className="admin-topbar-actions">
              <Link
                aria-label="Buka halaman pelanggan"
                className="admin-mobile-customer-link"
                to="/"
                title="Buka halaman pelanggan"
              >
                <Icon name="home" size={18} />
                <span>Beranda</span>
              </Link>
              <div className="admin-user">
                <span className="avatar-circle">
                  {(profile?.full_name || 'O').slice(0, 1).toUpperCase()}
                </span>
                <span>
                  <strong>{profile?.full_name || 'Pemilik'}</strong>
                  <small>Administrator</small>
                </span>
              </div>
              <button
                className="admin-topbar-logout"
                disabled={isSigningOut}
                onClick={handleSignOut}
                type="button"
              >
                <Icon name="logout" size={16} />
                <span>{isSigningOut ? 'Keluar...' : 'Keluar'}</span>
              </button>
            </div>
          </header>
          {signOutError && (
            <p className="layout-error" role="alert">
              {signOutError}
            </p>
          )}
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="customer-shell">
      <header className="customer-header">
        <Link className="customer-brand" to="/" aria-label="Seruput Beranda">
          <span className="brand-mark">S</span>
          <span>
            <strong>Seruput</strong>
            <small>Kopi &amp; Cerita</small>
          </span>
        </Link>
        <nav className="customer-top-links" aria-label="Navigasi utama">
          <NavLink to="/" end>
            Menu
          </NavLink>
          <NavLink to="/riwayat">Riwayat Pesanan</NavLink>
        </nav>
        <div className="customer-actions">
          <Link
            aria-label={`Keranjang, ${itemCount} item`}
            className="header-icon-link"
            to="/keranjang"
          >
            <Icon name="cart" />
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
          {user ? (
            <>
              {role === 'owner' && (
                <Link
                  aria-label="Dashboard Pemilik"
                  className="header-dashboard-link"
                  title="Dashboard Pemilik"
                  to="/dashboard"
                >
                  <Icon name="chart" size={18} />
                  <span>Dashboard</span>
                </Link>
              )}
              <Link
                aria-label={profile?.full_name || 'Profil saya'}
                className="header-icon-link"
                to="/akun"
              >
                <Icon name="user" />
                <span className="sr-only">{profile?.full_name || 'Profil saya'}</span>
              </Link>
              <button
                className="header-logout"
                disabled={isSigningOut}
                onClick={handleSignOut}
                type="button"
              >
                {isSigningOut ? 'Keluar...' : 'Keluar'}
              </button>
            </>
          ) : (
            <Link className="header-login" to="/login">
              Masuk
            </Link>
          )}
        </div>
      </header>
      {signOutError && (
        <p className="layout-error" role="alert">
          {signOutError}
        </p>
      )}
      <Outlet />
      <nav
        className={`customer-bottom-nav${role === 'owner' ? ' owner-bottom-nav' : ''}`}
        aria-label="Navigasi bawah"
      >
        <NavLink to="/" end>
          <Icon name="home" />
          <span>Beranda</span>
        </NavLink>
        {role === 'owner' && (
          <NavLink to="/dashboard">
            <Icon name="chart" />
            <span>Dashboard</span>
          </NavLink>
        )}
        <NavLink to="/keranjang">
          <Icon name="cart" />
          <span>Keranjang</span>
          {itemCount > 0 && <i>{itemCount}</i>}
        </NavLink>
        <NavLink to="/riwayat">
          <Icon name="receipt" />
          <span>Pesanan</span>
        </NavLink>
        <NavLink to={user ? '/akun' : '/login'}>
          <Icon name="user" />
          <span>Akun</span>
        </NavLink>
      </nav>
    </div>
  );
}
