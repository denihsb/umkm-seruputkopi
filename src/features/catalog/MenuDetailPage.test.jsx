import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import MenuDetailPage from './MenuDetailPage.jsx';

const { getMenuDetail } = vi.hoisted(() => ({ getMenuDetail: vi.fn() }));

vi.mock('./api.js', () => ({ getMenuDetail }));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/menu/1']}>
      <Routes>
        <Route path="/menu/:id" element={<MenuDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const menu = {
  id: 1,
  name: 'Kopi Susu Gula Aren',
  description: 'Kopi susu dengan manis gula aren.',
  basePrice: 18000,
  imageUrl: '',
  variantGroups: [
    {
      id: 1,
      name: 'Ukuran',
      isRequired: true,
      selectionType: 'single',
      options: [{ id: 2, name: 'Besar', priceDelta: 4000 }],
    },
  ],
};

describe('MenuDetailPage', () => {
  beforeEach(() => {
    getMenuDetail.mockReset();
  });
  afterEach(() => cleanup());

  it('menampilkan loading skeleton', () => {
    getMenuDetail.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByLabelText('Memuat detail menu')).toBeInTheDocument();
  });

  it('menampilkan galat dan dapat mencoba lagi', async () => {
    getMenuDetail.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(menu);

    renderPage();
    expect(await screen.findByText('Maaf, detail menu belum dapat dimuat.')).toBeInTheDocument();

    screen.getByRole('button', { name: 'Coba lagi' }).click();
    expect(await screen.findByRole('heading', { name: menu.name })).toBeInTheDocument();
    expect(getMenuDetail).toHaveBeenCalledTimes(2);
  });

  it('menampilkan kondisi menu tidak ditemukan', async () => {
    getMenuDetail.mockRejectedValue(new Error('Menu tidak ditemukan.'));

    renderPage();

    expect(await screen.findByText('Menu tidak ditemukan.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kembali ke katalog' })).toHaveAttribute('href', '/');
  });

  it('menampilkan nama, harga, deskripsi, dan grup varian', async () => {
    getMenuDetail.mockResolvedValue(menu);

    renderPage();

    expect(await screen.findByRole('heading', { name: menu.name })).toBeInTheDocument();
    expect(screen.getByText('Rp18.000')).toBeInTheDocument();
    expect(screen.getByText(menu.description)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ukuran' })).toBeInTheDocument();
    expect(screen.getByText('Wajib dipilih')).toBeInTheDocument();
    expect(screen.getByText('+Rp4.000')).toBeInTheDocument();
  });

  it('tidak menampilkan bagian varian untuk menu tanpa varian', async () => {
    getMenuDetail.mockResolvedValue({ ...menu, variantGroups: [] });

    renderPage();

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: menu.name })).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText('Pilihan varian')).not.toBeInTheDocument();
  });
});
