import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { CartProvider } from './CartContext.jsx';
import CartPage from './CartPage.jsx';

const coffee = {
  key: 'kopi|regular|panas',
  menuId: 1,
  menuName: 'Kopi Susu',
  basePrice: 27000,
  unitPrice: 27000,
  quantity: 2,
  note: '',
  selectedOptions: [
    { groupId: 1, groupName: 'Ukuran', optionId: 1, optionName: 'Regular', priceDelta: 0 },
    { groupId: 2, groupName: 'Suhu', optionId: 1, optionName: 'Panas', priceDelta: 0 },
    { groupId: 3, groupName: 'Gula', optionId: 1, optionName: 'Normal', priceDelta: 0 },
  ],
};

const tea = {
  key: 'teh',
  menuId: 2,
  menuName: 'Teh',
  basePrice: 15000,
  unitPrice: 15000,
  quantity: 1,
  note: '',
  selectedOptions: [],
};

function renderPage(initialItems = [coffee]) {
  return render(
    <MemoryRouter initialEntries={['/keranjang']}>
      <CartProvider initialItems={initialItems}>
        <CartPage />
      </CartProvider>
    </MemoryRouter>,
  );
}

describe('CartPage', () => {
  afterEach(() => cleanup());

  it('menampilkan item lengkap dengan ringkasan opsi dan harga', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Keranjang' })).toBeInTheDocument();
    expect(
      screen.getByText('Periksa lagi pesananmu sebelum lanjut ke pembayaran.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kopi Susu' })).toBeInTheDocument();
    expect(screen.getByText('Regular · Panas · Gula: Normal')).toHaveClass('text-sm');
    expect(screen.getByText('Harga satuan: Rp27.000')).toBeInTheDocument();
    expect(screen.getByText('Subtotal: Rp54.000')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tambah menu lainnya' })).toHaveAttribute('href', '/');
  });

  it('mengubah jumlah dan total saat tambah atau kurang ditekan', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Tambah jumlah Kopi Susu' }));
    expect(screen.getByLabelText('Jumlah Kopi Susu')).toHaveTextContent('3');
    expect(screen.getByText('Subtotal: Rp81.000')).toBeInTheDocument();
    expect(screen.getByText('Rp81.000')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Kurangi jumlah Kopi Susu' }));
    expect(screen.getByLabelText('Jumlah Kopi Susu')).toHaveTextContent('2');
    expect(screen.getByText('Subtotal: Rp54.000')).toBeInTheDocument();
  });

  it('membatasi jumlah dari 1 sampai 20', () => {
    renderPage([
      coffee,
      { ...tea, key: 'teh-min', menuName: 'Teh minimum' },
      { ...tea, key: 'teh-max', menuName: 'Teh maksimum', quantity: 20 },
    ]);

    expect(screen.getByRole('button', { name: 'Kurangi jumlah Teh minimum' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Tambah jumlah Teh maksimum' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tambah jumlah Teh maksimum' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kurangi jumlah Teh minimum' }));
    expect(screen.getByLabelText('Jumlah Teh maksimum')).toHaveTextContent('20');
    expect(screen.getByLabelText('Jumlah Teh minimum')).toHaveTextContent('1');
  });

  it('menghapus item dan menampilkan notifikasi', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Hapus Kopi Susu dari keranjang' }));

    expect(screen.queryByRole('heading', { name: 'Kopi Susu' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Item dihapus dari keranjang');
    expect(screen.getByText('Keranjang kosong')).toBeInTheDocument();
  });

  it('menampilkan kondisi kosong tanpa tombol Checkout', () => {
    renderPage([]);

    expect(screen.getByRole('heading', { name: 'Keranjang kosong' })).toBeInTheDocument();
    expect(screen.getByText('Pilih menu favoritmu untuk Seruput ya.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat menu' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('link', { name: 'Checkout' })).not.toBeInTheDocument();
  });

  it('menautkan tombol Checkout ke /checkout', () => {
    renderPage();

    expect(screen.getByRole('link', { name: 'Checkout' })).toHaveAttribute('href', '/checkout');
  });

  it('menghitung ulang total untuk dua baris item', () => {
    renderPage([coffee, tea]);

    expect(screen.getByText('Rp69.000')).toBeInTheDocument();
    expect(screen.getByText('Total item').nextSibling).toHaveTextContent('3');
  });
});
