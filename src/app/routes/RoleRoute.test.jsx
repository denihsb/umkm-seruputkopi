import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RoleRoute from './RoleRoute.jsx';

const mockUseAuth = vi.fn();

vi.mock('@/features/auth/useAuth.js', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderRoleRoute() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<RoleRoute allowedRoles={['owner']} />}>
          <Route path="/dashboard" element={<p>Dashboard owner</p>} />
        </Route>
        <Route path="/login" element={<p>Halaman masuk</p>} />
        <Route path="/" element={<p>Beranda</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoleRoute', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('mengarahkan pengguna belum login ke halaman masuk', () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, loading: false });

    renderRoleRoute();

    expect(screen.getByText('Halaman masuk')).toBeInTheDocument();
  });

  it('mengarahkan customer ke beranda', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'customer-1' },
      role: 'customer',
      loading: false,
    });

    renderRoleRoute();

    expect(screen.getByText('Beranda')).toBeInTheDocument();
  });

  it('menampilkan halaman untuk owner', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'owner-1' },
      role: 'owner',
      loading: false,
    });

    renderRoleRoute();

    expect(screen.getByText('Dashboard owner')).toBeInTheDocument();
  });
});
