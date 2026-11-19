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
      '/menu/kopi-susu-seruput.svg',
    );
  });
});
