import { describe, expect, it } from 'vitest';

import { formatOptionsSummary } from './summary.js';

describe('formatOptionsSummary', () => {
  it('menampilkan pilihan berurutan dengan label grup yang sesuai', () => {
    expect(
      formatOptionsSummary([
        { groupName: 'Ukuran', optionName: 'Regular' },
        { groupName: 'Suhu', optionName: 'Panas' },
        { groupName: 'Gula', optionName: 'Normal' },
        { groupName: 'Tambahan', optionName: 'Susu oat' },
      ]),
    ).toBe('Regular · Panas · Gula: Normal · Tambahan: Susu oat');
  });

  it('mengembalikan string kosong tanpa pilihan', () => {
    expect(formatOptionsSummary([])).toBe('');
  });
});
