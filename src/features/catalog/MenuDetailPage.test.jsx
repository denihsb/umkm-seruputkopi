import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import MenuDetailPage from './MenuDetailPage.jsx';

const { getMenuDetail } = vi.hoisted(() => ({ getMenuDetail: vi.fn() }));

vi.mock('./api.js', () => ({ getMenuDetail }));

function renderPage(onAdd) {
  return render(
    <MemoryRouter initialEntries={['/menu/1']}>
      <Routes>
        <Route path="/menu/:id" element={<MenuDetailPage onAdd={onAdd} />} />
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
    expect(screen.getAllByText('Rp18.000').length).toBeGreaterThan(0);
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

  it('mengubah varian, jumlah, harga, dan memanggil onAdd', async () => {
    const onAdd = vi.fn();
    const interactiveMenu = {
      ...menu,
      variantGroups: [
        ...menu.variantGroups,
        {
          id: 2,
          name: 'Suhu',
          isRequired: true,
          selectionType: 'single',
          options: [
            { id: 3, name: 'Panas', priceDelta: 0, isDefault: true },
            { id: 4, name: 'Dingin', priceDelta: 0, isDefault: false },
          ],
        },
        {
          id: 3,
          name: 'Es',
          isRequired: true,
          selectionType: 'single',
          options: [{ id: 5, name: 'Normal', priceDelta: 0, isDefault: true }],
        },
      ],
    };
    getMenuDetail.mockResolvedValue(interactiveMenu);

    renderPage(onAdd);
    await screen.findByRole('heading', { name: menu.name });
    fireEvent.click(screen.getByRole('radio', { name: 'Dingin' }));
    expect(screen.getByRole('radio', { name: 'Normal' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Besar/ }));
    expect(screen.getByRole('button', { name: /Tambah · Rp22.000/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tambah jumlah' }));
    expect(screen.getByRole('button', { name: /Tambah · Rp44.000/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Tambah · Rp44.000/ }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        menuId: 1,
        unitPrice: 22000,
        quantity: 2,
        selectedOptions: expect.arrayContaining([
          expect.objectContaining({ optionId: 2 }),
          expect.objectContaining({ optionId: 4 }),
          expect.objectContaining({ optionId: 5 }),
        ]),
      }),
    );
  });

  it('menonaktifkan tombol dan memberi pesan saat grup wajib kosong', async () => {
    getMenuDetail.mockResolvedValue({
      ...menu,
      variantGroups: [
        {
          ...menu.variantGroups[0],
          options: [{ id: 2, name: 'Besar', priceDelta: 4000, isDefault: false }],
        },
      ],
    });

    renderPage();
    await screen.findByRole('heading', { name: menu.name });
    expect(screen.getByRole('status')).toHaveTextContent('Pilih Ukuran');
    expect(screen.getByRole('button', { name: /^Tambah ·/ })).toBeDisabled();
  });
});
