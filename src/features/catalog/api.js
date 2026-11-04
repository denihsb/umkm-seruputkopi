import { supabase } from '@/lib/supabaseClient';

import { mapCategory, mapMenu, mapMenuDetail } from './mappers.js';

const FRIENDLY_ERROR = 'Gagal memuat menu. Periksa koneksi internet kamu.';

function escapeIlike(value) {
  return String(value).replace(/[\\%_]/g, '\\$&');
}

async function read(request) {
  try {
    const { data, error } = await request;
    if (error) throw error;
    return data;
  } catch {
    throw new Error(FRIENDLY_ERROR);
  }
}

export async function listCategories() {
  const data = await read(
    supabase.from('categories').select('id, name, sort_order').order('sort_order').order('name'),
  );
  return data.map(mapCategory);
}

export async function listMenus({ categoryId, keyword } = {}) {
  let query = supabase
    .from('menus')
    .select(
      'id, category_id, name, description, base_price, image_url, categories!inner(name, sort_order)',
    )
    .eq('is_active', true);

  if (categoryId !== undefined && categoryId !== null) {
    query = query.eq('category_id', categoryId);
  }
  if (keyword) {
    query = query.ilike('name', `%${escapeIlike(keyword)}%`);
  }

  const data = await read(query);
  return data
    .sort(
      (left, right) =>
        left.categories.sort_order - right.categories.sort_order ||
        left.name.localeCompare(right.name),
    )
    .map(mapMenu);
}

export async function getMenuDetail(id) {
  let data;
  try {
    const result = await supabase
      .from('menus')
      .select(
        `id, category_id, name, description, base_price, image_url,
        categories!inner(name, sort_order),
        menu_variants(
          id, name, price_delta, is_default, is_active,
          variant_groups(id, name, selection_type, is_required, sort_order)
        )`,
      )
      .eq('id', id)
      .eq('is_active', true)
      .eq('menu_variants.is_active', true)
      .maybeSingle();
    if (result.error) throw result.error;
    data = result.data;
  } catch {
    throw new Error(FRIENDLY_ERROR);
  }

  if (!data) {
    throw new Error('Menu tidak ditemukan.');
  }

  return mapMenuDetail(data);
}
