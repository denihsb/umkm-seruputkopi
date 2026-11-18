import { supabase } from '@/lib/supabaseClient.js';

const MENU_FIELDS =
  'id, category_id, name, description, base_price, image_url, is_active, categories(name)';

export async function listOwnerMenus() {
  const { data, error } = await supabase
    .from('menus')
    .select(MENU_FIELDS)
    .order('is_active', { ascending: false })
    .order('name');
  if (error) throw new Error('Gagal memuat menu. Periksa koneksi dan akses akun pemilik.');
  return (data ?? []).map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? 'Tanpa kategori',
    name: row.name,
    description: row.description ?? '',
    basePrice: row.base_price,
    imageUrl: row.image_url ?? '',
    isActive: row.is_active,
  }));
}

export async function listMenuCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('sort_order')
    .order('name');
  if (error) throw new Error('Gagal memuat kategori menu.');
  return data ?? [];
}

export async function saveMenu(values, menuId = null) {
  const payload = {
    category_id: Number(values.categoryId),
    name: values.name.trim(),
    description: values.description.trim() || null,
    base_price: Number(values.basePrice),
    image_url: values.imageUrl.trim() || null,
  };
  const request = menuId
    ? supabase.from('menus').update(payload).eq('id', menuId)
    : supabase.from('menus').insert(payload);
  const { error } = await request;
  if (error)
    throw new Error(
      'Menu gagal disimpan. Pastikan data valid dan akun memiliki izin pengelolaan menu.',
    );
}

export async function setMenuActive(menuId, isActive) {
  const { error } = await supabase.from('menus').update({ is_active: isActive }).eq('id', menuId);
  if (error) throw new Error('Status menu gagal diperbarui. Coba lagi.');
}

export async function listMenuAddons(menuId) {
  const { data, error } = await supabase
    .from('menu_variants')
    .select('id, name, price_delta, is_active, variant_groups(name)')
    .eq('menu_id', menuId)
    .order('name');
  if (error) throw new Error('Gagal memuat add-ons menu.');
  return (data ?? [])
    .filter((row) => row.variant_groups?.name === 'Tambahan')
    .map((row) => ({
      id: row.id,
      name: row.name,
      priceDelta: row.price_delta,
      isActive: row.is_active,
    }));
}

export async function addMenuAddon(menuId, values) {
  const { data: group, error: groupError } = await supabase
    .from('variant_groups')
    .select('id')
    .eq('name', 'Tambahan')
    .maybeSingle();
  if (groupError || !group)
    throw new Error(
      'Grup varian "Tambahan" belum tersedia di database. Jalankan seed.sql terlebih dahulu.',
    );
  const { error } = await supabase.from('menu_variants').insert({
    menu_id: menuId,
    group_id: group.id,
    name: values.name.trim(),
    price_delta: Number(values.priceDelta) || 0,
    is_default: false,
  });
  if (error)
    throw new Error('Add-on gagal ditambahkan. Pastikan nama belum digunakan untuk menu ini.');
}

export async function setMenuAddonActive(addonId, isActive) {
  const { error } = await supabase
    .from('menu_variants')
    .update({ is_active: isActive })
    .eq('id', addonId);
  if (error) throw new Error('Status add-on gagal diperbarui.');
}
