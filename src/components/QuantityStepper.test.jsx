import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import QuantityStepper from './QuantityStepper.jsx';

describe('QuantityStepper', () => {
  it('membatasi jumlah pada min dan max', () => {
    const onChange = vi.fn();
    const { rerender } = render(<QuantityStepper onChange={onChange} value={1} />);
    expect(screen.getByRole('button', { name: 'Kurangi jumlah' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Tambah jumlah' }));
    expect(onChange).toHaveBeenCalledWith(2);

    rerender(<QuantityStepper onChange={onChange} value={20} />);
    expect(screen.getByRole('button', { name: 'Tambah jumlah' })).toBeDisabled();
  });
});
