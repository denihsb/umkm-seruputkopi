import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AccountPage from './AccountPage.jsx';

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock('@/features/auth/useAuth.js', () => ({
  useAuth: mocks.useAuth,
}));

function CurrentPath() {
  const location = useLocation();
  return <p>Halaman: {location.pathname}</p>;
}

function renderAccountPage() {
  return render(
    <MemoryRouter initialEntries={['/akun']}>
      <Routes>
        <Route element={<AccountPage />} path="/akun" />
        <Route element={<CurrentPath />} path="/" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AccountPage', () => {
  beforeEach(() => {
    mocks.signOut.mockReset();
    mocks.useAuth.mockReturnValue({
      profile: { full_name: 'Dewi Seruput' },
      role: 'customer',
      signOut: mocks.signOut,
      user: { email: 'dewi@example.com' },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('menampilkan nama, email, dan lencana peran', () => {
    renderAccountPage();

    expect(screen.getByText('Dewi Seruput')).toBeInTheDocument();
    expect(screen.getByText('dewi@example.com')).toBeInTheDocument();
    expect(screen.getByText('Pelanggan')).toBeInTheDocument();
  });

  it('memanggil signOut dan mengarahkan ke beranda', async () => {
    mocks.signOut.mockResolvedValue();
    renderAccountPage();

    fireEvent.click(screen.getByRole('button', { name: 'Keluar dari akun' }));

    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(await screen.findByText('Halaman: /')).toBeInTheDocument();
  });
});
