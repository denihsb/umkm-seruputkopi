import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useDebouncedValue from './useDebouncedValue.js';

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('mengembalikan nilai setelah jeda dan membersihkan timer nilai sebelumnya', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value), {
      initialProps: { value: 'awal' },
    });

    rerender({ value: 'baru' });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('awal');

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('baru');
  });

  it('membersihkan timer saat unmount', () => {
    const { unmount } = renderHook(() => useDebouncedValue('nilai'));

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
