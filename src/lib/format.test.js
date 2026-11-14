import { describe, expect, it } from 'vitest';

import { formatDateTime, formatRupiah } from './format.js';

describe('formatRupiah', () => {
  it.each([
    [27000, 'Rp27.000'],
    [0, 'Rp0'],
    [1250000, 'Rp1.250.000'],
  ])('memformat %s menjadi %s', (value, expected) => {
    expect(formatRupiah(value)).toBe(expected);
  });

  describe('formatDateTime', () => {
    it('memformat waktu ke zona Asia/Jakarta', () => {
      expect(formatDateTime('2026-11-14T06:45:00Z')).toBe('14 Nov 2026, 13.45');
    });
  });
});
