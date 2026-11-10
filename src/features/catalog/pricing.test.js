import { describe, expect, it } from 'vitest';

import {
  buildCartItem,
  calcUnitPrice,
  getInitialSelection,
  getMissingRequiredGroups,
  isGroupVisible,
  toggleOption,
} from './pricing.js';

const groups = [
  {
    id: 'size',
    name: 'Ukuran',
    isRequired: true,
    selectionType: 'single',
    options: [
      { id: 'regular', name: 'Regular', priceDelta: 0, isDefault: true },
      { id: 'large', name: 'Large', priceDelta: 4000, isDefault: false },
    ],
  },
  {
    id: 'temp',
    name: 'Suhu',
    isRequired: true,
    selectionType: 'single',
    options: [
      { id: 'hot', name: 'Panas', priceDelta: 0, isDefault: true },
      { id: 'cold', name: 'Dingin', priceDelta: 0, isDefault: false },
    ],
  },
  {
    id: 'ice',
    name: 'Es',
    isRequired: true,
    selectionType: 'single',
    options: [
      { id: 'normal-ice', name: 'Normal', priceDelta: 0, isDefault: true },
      { id: 'less-ice', name: 'Sedikit', priceDelta: 0, isDefault: false },
    ],
  },
  {
    id: 'extra',
    name: 'Tambahan',
    isRequired: false,
    selectionType: 'multiple',
    options: [
      { id: 'shot', name: 'Extra shot', priceDelta: 5000, isDefault: false },
      { id: 'jelly', name: 'Jelly', priceDelta: 3000, isDefault: false },
    ],
  },
];

describe('pricing', () => {
  it('membentuk seleksi awal dari default', () => {
    expect(getInitialSelection(groups)).toEqual({
      size: ['regular'],
      temp: ['hot'],
      ice: ['normal-ice'],
    });
  });

  it('menyembunyikan Es saat Panas dan mengisi default saat Dingin', () => {
    const initial = getInitialSelection(groups);
    expect(isGroupVisible(groups[2], groups, initial)).toBe(false);
    const cold = toggleOption(groups, initial, 'temp', 'cold');
    expect(isGroupVisible(groups[2], groups, cold)).toBe(true);
    expect(cold.ice).toEqual(['normal-ice']);
    expect(toggleOption(groups, cold, 'temp', 'hot').ice).toEqual([]);
  });

  it('menghitung harga hanya dari opsi grup yang terlihat', () => {
    const selection = { size: ['large'], temp: ['hot'], ice: ['normal-ice'], extra: ['shot'] };
    expect(calcUnitPrice(18000, groups, selection)).toBe(27000);
    expect(calcUnitPrice(18000, groups, { ...selection, extra: ['shot', 'jelly'] })).toBe(30000);
  });

  it('mendeteksi grup wajib kosong dan membuat key stabil', () => {
    expect(getMissingRequiredGroups(groups, { temp: ['hot'] })).toEqual(['Ukuran']);
    const menu = { id: 1, name: 'Kopi', basePrice: 18000 };
    const first = buildCartItem(
      menu,
      groups,
      {
        size: ['large'],
        temp: ['cold'],
        ice: ['normal-ice'],
        extra: ['shot', 'jelly'],
      },
      2,
    );
    const second = buildCartItem(
      menu,
      groups,
      {
        size: ['large'],
        temp: ['cold'],
        ice: ['normal-ice'],
        extra: ['jelly', 'shot'],
      },
      2,
    );
    expect(first.key).toBe(second.key);
    expect(buildCartItem(menu, groups, { ...first, size: ['regular'] }, 1).key).not.toBe(first.key);
  });

  it('menampilkan Es untuk menu yang hanya memiliki Dingin', () => {
    const coldOnly = [
      groups[2],
      {
        ...groups[1],
        options: [{ ...groups[1].options[1], isDefault: true }],
      },
    ];
    const selection = getInitialSelection(coldOnly);
    expect(isGroupVisible(coldOnly[0], coldOnly, selection)).toBe(true);
  });
});
