import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getMenuDetail, listCategories, listMenus } from './api.js';

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: mockFrom },
}));

function mockQuery(result) {
  const query = {
    select: vi.fn(() => query),
    order: vi.fn(() => query),
    eq: vi.fn(() => query),
    ilike: vi.fn(() => query),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
}

describe('catalog api', () => {
  beforeEach(() => mockFrom.mockReset());

  it('menerjemahkan galat Supabase ke pesan Indonesia', async () => {
    mockFrom.mockReturnValue(
      mockQuery({ data: null, error: new Error('database connection failed') }),
    );

    await expect(listCategories()).rejects.toThrow(
      'Gagal memuat menu. Periksa koneksi internet kamu.',
    );
  });

  it('mengembalikan galat khusus bila menu tidak ditemukan', async () => {
    mockFrom.mockReturnValue(mockQuery({ data: null, error: null }));

    await expect(getMenuDetail('999')).rejects.toThrow('Menu tidak ditemukan.');
  });

  it('meneruskan kata kunci dengan karakter khusus yang di-escape', async () => {
    const query = mockQuery({ data: [], error: null });
    mockFrom.mockReturnValue(query);

    await listMenus({ keyword: '  kopi_100%  ' });

    expect(query.ilike).toHaveBeenCalledWith('name', '%kopi\\_100\\%%');
  });

  it('tidak mencari bila kata kunci hanya berisi spasi', async () => {
    const query = mockQuery({ data: [], error: null });
    mockFrom.mockReturnValue(query);

    await listMenus({ keyword: '   ' });

    expect(query.ilike).not.toHaveBeenCalled();
  });
});
