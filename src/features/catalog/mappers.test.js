import { describe, expect, it } from 'vitest';

import { groupVariants } from './mappers.js';

const group = (id, sortOrder, name = `Grup ${id}`) => ({
  id,
  name,
  selection_type: 'single',
  is_required: true,
  sort_order: sortOrder,
});

describe('groupVariants', () => {
  it('mengelompokkan satu grup dan opsinya', () => {
    expect(
      groupVariants([
        {
          id: 2,
          name: 'Oat',
          price_delta: 5000,
          is_default: true,
          is_active: true,
          variant_groups: group(1, 0),
        },
      ]),
    ).toEqual([
      {
        id: 1,
        name: 'Grup 1',
        selectionType: 'single',
        isRequired: true,
        sortOrder: 0,
        options: [{ id: 2, name: 'Oat', priceDelta: 5000, isDefault: true }],
      },
    ]);
  });

  it('mengurutkan grup dan opsi, serta mengabaikan opsi nonaktif', () => {
    expect(
      groupVariants([
        {
          id: 3,
          name: 'Zest',
          price_delta: 0,
          is_default: false,
          is_active: true,
          variant_groups: group(2, 1, 'Ukuran'),
        },
        {
          id: 2,
          name: 'Besar',
          price_delta: 5000,
          is_default: true,
          is_active: true,
          variant_groups: group(2, 1, 'Ukuran'),
        },
        {
          id: 1,
          name: 'Gula',
          price_delta: 0,
          is_default: false,
          is_active: false,
          variant_groups: group(1, 0, 'Gula'),
        },
        {
          id: 4,
          name: 'Kecil',
          price_delta: 0,
          is_default: true,
          is_active: true,
          variant_groups: group(1, 0, 'Gula'),
        },
      ]),
    ).toMatchObject([
      { id: 1, options: [{ id: 4 }] },
      { id: 2, options: [{ id: 2 }, { id: 3 }] },
    ]);
  });

  it('mengembalikan array kosong untuk menu tanpa varian dan mendukung banyak grup', () => {
    expect(groupVariants()).toEqual([]);
    expect(
      groupVariants([
        {
          id: 1,
          name: 'Panas',
          price_delta: 0,
          is_default: true,
          is_active: true,
          variant_groups: group(2, 2),
        },
        {
          id: 2,
          name: 'Normal',
          price_delta: 0,
          is_default: true,
          is_active: true,
          variant_groups: group(1, 1),
        },
      ]),
    ).toHaveLength(2);
  });
});
