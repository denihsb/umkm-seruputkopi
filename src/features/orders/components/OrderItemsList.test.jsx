import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import OrderItemsList from './OrderItemsList.jsx';

describe('OrderItemsList', () => {
  it('menampilkan jumlah, nama, opsi, dan subtotal item', () => {
    render(
      <OrderItemsList
        items={[
          {
            id: 'item-1',
            menuName: 'Kopi Susu',
            quantity: 2,
            subtotal: 30000,
            options: [{ id: 'option-1', optionName: 'Sedang' }],
          },
        ]}
      />,
    );

    expect(screen.getByText('2 x Kopi Susu')).toBeInTheDocument();
    expect(screen.getByText('Sedang')).toBeInTheDocument();
    expect(screen.getByText('Rp30.000')).toBeInTheDocument();
  });
});
