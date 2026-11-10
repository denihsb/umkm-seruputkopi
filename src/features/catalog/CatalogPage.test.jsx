import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import CatalogPage from './CatalogPage.jsx';

const { listCategories, listMenus } = vi.hoisted(() => ({
  listCategories: vi.fn(),
  listMenus: vi.fn(),
}));

vi.mock('./api.js', () => ({ listCategories, listMenus }));

const categories = [
  { id: 2, name: 'Kopi', sortOrder: 1 },
  { id: 3, name: 'Non-Kopi', sortOrder: 2 },
];
const menus = [
  {
    id: 10,
    categoryId: 2,
    name: 'Kopi Susu Gula Aren',
    basePrice: 18000,
    imageUrl: '',
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <CatalogPage />
    </MemoryRouter>,
  );
}

describe('CatalogPage', () => {
  beforeEach(() => {
    listCategories.mockReset().mockResolvedValue(categories);
    listMenus.mockReset().mockResolvedValue(menus);
  });
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('menampilkan menu dan detail dasar pada kartu', async () => {
    renderPage();

    expect(await screen.findByText('Kopi Susu Gula Aren')).toBeInTheDocument();
    expect(screen.getByText('Rp18.000')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kopi Susu Gula Aren/ })).toHaveAttribute(
      'href',
      '/menu/10',
    );
  });

  it('memuat ulang menu dengan kategori yang dipilih', async () => {
    renderPage();
    await screen.findByText('Kopi Susu Gula Aren');

    fireEvent.click(screen.getByRole('button', { name: 'Non-Kopi' }));

    await waitFor(() => expect(listMenus).toHaveBeenLastCalledWith({ categoryId: 3 }));
    expect(screen.getByRole('button', { name: 'Non-Kopi' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('menunda pencarian, memangkas kata kunci, dan mencegah submit halaman', async () => {
    renderPage();
    await screen.findByText('Kopi Susu Gula Aren');
    vi.useFakeTimers();
    const input = screen.getByRole('searchbox', { name: 'Cari menu' });

    fireEvent.change(input, { target: { value: '  kopi  ' } });
    fireEvent.submit(input.closest('form'));
    expect(listMenus).toHaveBeenCalledTimes(1);

    await act(async () => vi.advanceTimersByTime(300));
    vi.useRealTimers();
    await waitFor(() => expect(listMenus).toHaveBeenLastCalledWith({ keyword: 'kopi' }));
  });

  it('menggabungkan kata kunci dengan kategori aktif', async () => {
    renderPage();
    await screen.findByText('Kopi Susu Gula Aren');

    fireEvent.click(screen.getByRole('button', { name: 'Non-Kopi' }));
    vi.useFakeTimers();
    const input = screen.getByRole('searchbox', { name: 'Cari menu' });
    fireEvent.change(input, { target: { value: '  susu ' } });
    await act(async () => vi.advanceTimersByTime(300));
    vi.useRealTimers();

    await waitFor(() =>
      expect(listMenus).toHaveBeenLastCalledWith({ categoryId: 3, keyword: 'susu' }),
    );
  });

  it('menganggap kata kunci spasi sebagai kosong', async () => {
    renderPage();
    await screen.findByText('Kopi Susu Gula Aren');
    vi.useFakeTimers();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Cari menu' }), {
      target: { value: '   ' },
    });

    await act(async () => vi.advanceTimersByTime(300));
    vi.useRealTimers();
    await waitFor(() => expect(listMenus).toHaveBeenLastCalledWith({}));
  });

  it('mengosongkan pencarian dan mengembalikan fokus', async () => {
    renderPage();
    await screen.findByText('Kopi Susu Gula Aren');
    vi.useFakeTimers();
    const input = screen.getByRole('searchbox', { name: 'Cari menu' });
    fireEvent.change(input, { target: { value: 'kopi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Hapus pencarian' }));

    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    await act(async () => vi.advanceTimersByTime(300));
    vi.useRealTimers();
    await waitFor(() => expect(listMenus).toHaveBeenLastCalledWith({}));
  });

  it('menampilkan jumlah hasil dan pesan saat hasil pencarian kosong', async () => {
    listMenus.mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(listMenus).toHaveBeenCalled());
    vi.useFakeTimers();
    const input = screen.getByRole('searchbox', { name: 'Cari menu' });
    fireEvent.change(input, { target: { value: '  tidak ada  ' } });
    await act(async () => vi.advanceTimersByTime(300));
    vi.useRealTimers();

    expect(await screen.findByText('0 menu ditemukan')).toBeInTheDocument();
    expect(await screen.findByText('Menu "tidak ada" tidak ditemukan.')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Hapus pencarian' })).toHaveLength(2);
  });

  it('mengabaikan respons pencarian lama yang tiba belakangan', async () => {
    const requests = [];
    listMenus.mockImplementation(
      () =>
        new Promise((resolve) => {
          requests.push(resolve);
        }),
    );
    renderPage();
    const input = screen.getByRole('searchbox', { name: 'Cari menu' });
    vi.useFakeTimers();
    fireEvent.change(input, { target: { value: 'baru' } });
    await act(async () => vi.advanceTimersByTime(300));
    vi.useRealTimers();
    expect(requests).toHaveLength(2);

    await act(async () => requests[1]([]));
    expect(await screen.findByText('Menu "baru" tidak ditemukan.')).toBeInTheDocument();
    await act(async () => requests[0](menus));
    expect(screen.queryByText('Kopi Susu Gula Aren')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('menampilkan skeleton saat kategori atau menu masih dimuat', () => {
    listCategories.mockReturnValue(new Promise(() => {}));
    listMenus.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByRole('status', { name: 'Memuat daftar menu' })).toBeInTheDocument();
  });

  it('menampilkan galat dan memuat ulang saat tombol coba lagi dipilih', async () => {
    listMenus.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(menus);

    renderPage();
    expect(await screen.findByText(/daftar menu belum dapat dimuat/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));

    expect(await screen.findByText('Kopi Susu Gula Aren')).toBeInTheDocument();
    expect(listMenus).toHaveBeenCalledTimes(2);
  });

  it('menampilkan pesan saat kategori tidak memiliki menu', async () => {
    listMenus.mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText('Belum ada menu di kategori ini.')).toBeInTheDocument();
  });
});
