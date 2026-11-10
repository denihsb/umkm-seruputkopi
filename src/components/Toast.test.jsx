import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import Toast from './Toast.jsx';

describe('Toast', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('hilang otomatis setelah empat detik', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <MemoryRouter>
        <Toast onClose={onClose} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    vi.advanceTimersByTime(4000);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
