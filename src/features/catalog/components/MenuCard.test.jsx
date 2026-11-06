import { render, screen } from '@testing-library/react';
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
});
