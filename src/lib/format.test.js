import { describe, expect, it } from 'vitest';

import { formatRupiah } from './format.js';

describe('formatRupiah', () => {
  it.each([
    [27000, 'Rp27.000'],
    [0, 'Rp0'],
    [1250000, 'Rp1.250.000'],
  ])('memformat %s menjadi %s', (value, expected) => {
    expect(formatRupiah(value)).toBe(expected);
  });
});
