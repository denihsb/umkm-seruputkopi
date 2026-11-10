import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import VariantGroup from './VariantGroup.jsx';

const group = {
  id: 1,
  name: 'Ukuran',
  isRequired: true,
  selectionType: 'single',
  options: [
    { id: 1, name: 'Regular', priceDelta: 0 },
    { id: 2, name: 'Large', priceDelta: 4000 },
  ],
};

describe('VariantGroup', () => {
  it('menggunakan radio dan menampilkan status wajib serta selisih harga', () => {
    const onChange = vi.fn();
    render(<VariantGroup group={group} onChange={onChange} selectedIds={[]} />);
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByText('Wajib dipilih')).toBeInTheDocument();
    expect(screen.getByText('+Rp4.000')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Large/ }));
    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it('menggunakan checkbox untuk grup multiple', () => {
    const onChange = vi.fn();
    render(
      <VariantGroup
        group={{ ...group, selectionType: 'multiple', isRequired: false }}
        onChange={onChange}
        selectedIds={[1]}
      />,
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    fireEvent.click(screen.getByRole('checkbox', { name: /Large/ }));
    expect(onChange).toHaveBeenCalledWith([1, 2]);
  });
});
