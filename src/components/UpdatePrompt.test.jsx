import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useRegisterSW } from 'virtual:pwa-register/react';
import UpdatePrompt from './UpdatePrompt.jsx';

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: vi.fn(),
}));

describe('UpdatePrompt', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('tidak merender apa pun secara bawaan', () => {
    useRegisterSW.mockReturnValue({
      needRefresh: [false, vi.fn()],
      offlineReady: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    });

    const { container } = render(<UpdatePrompt />);

    expect(container).toBeEmptyDOMElement();
  });

  it('menampilkan kartu pembaruan saat needRefresh aktif', () => {
    useRegisterSW.mockReturnValue({
      needRefresh: [true, vi.fn()],
      offlineReady: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    });

    render(<UpdatePrompt />);

    expect(screen.getByText('Versi baru tersedia')).toBeInTheDocument();
  });

  it('memuat ulang saat tombol Muat ulang ditekan', () => {
    const updateServiceWorker = vi.fn();
    useRegisterSW.mockReturnValue({
      needRefresh: [true, vi.fn()],
      offlineReady: [false, vi.fn()],
      updateServiceWorker,
    });

    render(<UpdatePrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Muat ulang' }));

    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('menyembunyikan kartu saat tombol Nanti ditekan', () => {
    const setNeedRefresh = vi.fn();
    useRegisterSW.mockReturnValue({
      needRefresh: [true, setNeedRefresh],
      offlineReady: [false, vi.fn()],
      updateServiceWorker: vi.fn(),
    });

    render(<UpdatePrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Nanti' }));

    expect(setNeedRefresh).toHaveBeenCalledWith(false);
  });

  it('menampilkan notifikasi offline saat offlineReady aktif', () => {
    useRegisterSW.mockReturnValue({
      needRefresh: [false, vi.fn()],
      offlineReady: [true, vi.fn()],
      updateServiceWorker: vi.fn(),
    });

    render(<UpdatePrompt />);

    expect(screen.getByText('Siap dipakai offline')).toBeInTheDocument();
  });
});
