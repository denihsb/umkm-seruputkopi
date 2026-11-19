import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import MenuCard from './MenuCard.jsx';

describe('MenuCard', () => {
  it('menautkan seluruh kartu ke halaman menu', () => {
    render(
      <MemoryRouter>
        <MenuCard menu={{ id: 42, name: 'Kopi Susu', basePrice: 18000, imageUrl: '' }} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Kopi Susu/ })).toHaveAttribute('href', '/menu/42');
    expect(screen.getByRole('img', { name: 'Kopi Susu' })).toBeInTheDocument();
  });

  it('mengganti URL rusak dengan ilustrasi menu lokal', () => {
    render(
      <MemoryRouter>
        <MenuCard
          menu={{
            id: 1,
            name: 'Kopi Susu Seruput',
            basePrice: 18000,
            imageUrl: '/menu/gambar-rusak.jpg',
          }}
        />
      </MemoryRouter>,
    );

    const image = screen.getByRole('img', { name: 'Kopi Susu Seruput' });
    expect(image).toHaveAttribute('src', '/menu/gambar-rusak.jpg');

    fireEvent.error(image);

    expect(screen.getByRole('img', { name: 'Kopi Susu Seruput' })).toHaveAttribute(
      'src',
      '/menu/kopi-susu-seruput.jpg',
    );
  });

  it.each([
    ['Americano', '/menu/americano.jpg'],
    ['Cafe Latte', '/menu/cafe-latte.jpg'],
    ['Kopi Susu Gula Aren', '/menu/kopi-susu-gula-aren.jpg'],
    ['Kopi Tubruk', '/menu/kopi-tubruk.jpg'],
    ['Mocha', '/menu/mocha.jpg'],
    ['Es Teh', '/menu/es-teh.jpg'],
  ])('memetakan nama menu lama %s ke ilustrasi lokal', (name, imageUrl) => {
    render(
      <MemoryRouter>
        <MenuCard menu={{ id: 1, name, basePrice: 18000, imageUrl: '' }} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('img', { name })).toHaveAttribute('src', imageUrl);
  });
});
