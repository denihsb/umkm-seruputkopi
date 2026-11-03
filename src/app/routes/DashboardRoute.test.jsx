import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

const mockUseAuth = vi.fn();

vi.mock('@/features/auth/useAuth.js', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderDashboardRoute() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['owner']} />}>
            <Route path="/dashboard" element={<p>Dashboard pemilik</p>} />
          </Route>
        </Route>
        <Route path="/login" element={<p>Halaman masuk</p>} />
        <Route path="/" element={<p>Beranda</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('route dashboard berdasarkan peran', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('mengarahkan pengguna belum login ke login dengan lokasi asal', () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, loading: false });

    renderDashboardRoute();

    expect(screen.getByText('Halaman masuk')).toBeInTheDocument();
  });

  it('mengarahkan customer ke beranda', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'customer-1' },
      role: 'customer',
      loading: false,
    });

    renderDashboardRoute();

    expect(screen.getByText('Beranda')).toBeInTheDocument();
  });

  it('menampilkan dashboard untuk owner', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'owner-1' },
      role: 'owner',
      loading: false,
    });

    renderDashboardRoute();

    expect(screen.getByText('Dashboard pemilik')).toBeInTheDocument();
  });

  it('mengarahkan owner ke login jika sesi berakhir saat berada di halaman terproteksi', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'owner-1' },
      role: 'owner',
      loading: false,
    });

    const view = renderDashboardRoute();
    expect(screen.getByText('Dashboard pemilik')).toBeInTheDocument();

    mockUseAuth.mockReturnValue({ user: null, role: null, loading: false });
    view.rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['owner']} />}>
              <Route path="/dashboard" element={<p>Dashboard pemilik</p>} />
            </Route>
          </Route>
          <Route path="/login" element={<p>Halaman masuk</p>} />
          <Route path="/" element={<p>Beranda</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Halaman masuk')).toBeInTheDocument();
  });
});
