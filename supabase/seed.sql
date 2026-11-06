-- =====================================================================
-- Seruput: seed data 20 menu (4 kategori, 5 grup varian)
-- Simpan sebagai supabase/seed.sql. Aman dijalankan berulang.
-- Cara pakai: Supabase, SQL Editor, tempel seluruh isi berkas, Run.
--
-- Catatan:
-- 1. Nama dan deskripsi menu adalah data contoh. Ganti dengan konten dari
--    Asjad lewat tabel _seed_menu di bawah, lalu jalankan ulang.
-- 2. Nama grup "Gula" dan opsi "Normal / Kurang / Tanpa" mengikuti skema.
--    Kalau Figma memakai "Tingkat gula" atau "Tanpa gula", ubah di sini
--    dan di seluruh berkas ini sebelum dijalankan.
-- 3. image_url sengaja null. Isi dengan '/menu/nama-berkas.jpg' setelah
--    foto ada di public/menu/.
-- 4. Kalau database sudah berisi menu lama dengan nama opsi yang berbeda,
--    jalankan blok RESET di bawah dulu (hanya aman sebelum ada pesanan
--    yang perlu dipertahankan).
-- =====================================================================

-- ---------------------------------------------------------------------
-- RESET (opsional, hapus tanda komentar bila perlu)
-- ---------------------------------------------------------------------
-- delete from public.menu_variants;
-- delete from public.menus;

begin;

-- ---------------------------------------------------------------------
-- 1. Kategori
-- ---------------------------------------------------------------------
insert into public.categories (name, sort_order) values
  ('Kopi', 1),
  ('Non-Kopi', 2),
  ('Teh', 3),
  ('Camilan', 4)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- 2. Grup varian
-- ---------------------------------------------------------------------
insert into public.variant_groups (name, selection_type, is_required, sort_order) values
  ('Ukuran', 'single', true, 1),
  ('Suhu', 'single', true, 2),
  ('Gula', 'single', true, 3),
  ('Es', 'single', false, 4),
  ('Tambahan', 'multiple', false, 5)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- 3. Daftar menu (sumber tunggal, dibaca oleh langkah menu dan varian)
--    temp_mode: both = panas atau dingin, cold_only = hanya dingin,
--               hot_only = hanya panas, none = tanpa varian (camilan)
--    addons   : true bila grup Tambahan berlaku untuk menu tersebut
-- ---------------------------------------------------------------------
create temp table _seed_menu (
  category    text,
  name        text,
  description text,
  base_price  integer,
  temp_mode   text,
  addons      boolean
) on commit drop;

insert into _seed_menu (category, name, description, base_price, temp_mode, addons) values
  -- Kopi (7)
  ('Kopi', 'Kopi Susu Seruput', 'Espresso pilihan, susu segar, dan gula aren dengan rasa creamy yang pas.', 18000, 'both', true),
  ('Kopi', 'Americano', 'Espresso dengan air, bersih dan segar rasanya.', 15000, 'both', true),
  ('Kopi', 'Latte', 'Espresso dengan susu steam yang lembut dan busa tipis.', 20000, 'both', true),
  ('Kopi', 'Cappuccino', 'Espresso, susu, dan busa tebal dengan rasa yang seimbang.', 20000, 'both', true),
  ('Kopi', 'Es Kopi Gula Aren', 'Kopi susu dingin dengan gula aren, manisnya pas.', 19000, 'cold_only', true),
  ('Kopi', 'Mocha', 'Espresso, coklat, dan susu dengan manis yang tidak berlebihan.', 22000, 'both', true),
  ('Kopi', 'Kopi Tubruk', 'Kopi seduh tradisional yang kental dan pekat.', 12000, 'hot_only', false),
  -- Non-Kopi (5)
  ('Non-Kopi', 'Coklat Dingin', 'Coklat pekat dengan susu dingin dan es.', 20000, 'cold_only', true),
  ('Non-Kopi', 'Matcha Latte', 'Matcha dengan susu, rasa teh hijau yang lembut.', 22000, 'both', true),
  ('Non-Kopi', 'Red Velvet Latte', 'Susu dengan rasa red velvet yang manis dan lembut.', 22000, 'both', true),
  ('Non-Kopi', 'Taro Latte', 'Susu dengan taro ungu yang creamy dan manis.', 21000, 'both', true),
  ('Non-Kopi', 'Susu Madu', 'Susu segar dengan madu, sederhana dan menenangkan.', 16000, 'both', false),
  -- Teh (4)
  ('Teh', 'Teh Tarik', 'Teh pekat dengan susu, ditarik sampai berbusa.', 14000, 'both', false),
  ('Teh', 'Es Teh Lemon', 'Teh dingin dengan perasan lemon yang segar.', 12000, 'cold_only', false),
  ('Teh', 'Teh Melati', 'Teh melati yang harum, paling enak diseduh hangat.', 10000, 'hot_only', false),
  ('Teh', 'Teh Leci', 'Teh dengan buah leci, manis dan menyegarkan.', 15000, 'both', false),
  -- Camilan (4), tanpa varian
  ('Camilan', 'Roti Bakar Coklat Keju', 'Roti tebal dibakar dengan selai coklat dan parutan keju.', 16000, 'none', false),
  ('Camilan', 'Kentang Goreng', 'Kentang goreng renyah, cocok menemani kopi.', 15000, 'none', false),
  ('Camilan', 'Pisang Goreng Madu', 'Pisang goreng hangat dengan siraman madu.', 14000, 'none', false),
  ('Camilan', 'Brownies Coklat', 'Brownies coklat yang padat dan lembut.', 13000, 'none', false);

-- ---------------------------------------------------------------------
-- 4. Menu (dilewati bila nama sudah ada)
-- ---------------------------------------------------------------------
insert into public.menus (category_id, name, description, base_price, image_url, is_active)
select c.id, s.name, s.description, s.base_price, null, true
from _seed_menu s
join public.categories c on c.name = s.category
where not exists (select 1 from public.menus m where m.name = s.name);

-- ---------------------------------------------------------------------
-- 5. Varian per menu (dilewati bila kombinasi menu, grup, nama sudah ada)
-- ---------------------------------------------------------------------

-- Ukuran: semua minuman
insert into public.menu_variants (menu_id, group_id, name, price_delta, is_default)
select m.id, g.id, o.name, o.delta, o.is_default
from _seed_menu s
join public.menus m on m.name = s.name
join public.variant_groups g on g.name = 'Ukuran'
cross join (values ('Regular', 0, true), ('Large', 4000, false)) as o(name, delta, is_default)
where s.temp_mode <> 'none'
on conflict (menu_id, group_id, name) do nothing;

-- Suhu: sesuai temp_mode, default Panas (atau Dingin bila hanya dingin)
insert into public.menu_variants (menu_id, group_id, name, price_delta, is_default)
select m.id, g.id, o.name, 0,
       (o.name = case when s.temp_mode = 'cold_only' then 'Dingin' else 'Panas' end)
from _seed_menu s
join public.menus m on m.name = s.name
join public.variant_groups g on g.name = 'Suhu'
cross join (values ('Panas'), ('Dingin')) as o(name)
where s.temp_mode <> 'none'
  and (s.temp_mode = 'both'
       or (s.temp_mode = 'cold_only' and o.name = 'Dingin')
       or (s.temp_mode = 'hot_only' and o.name = 'Panas'))
on conflict (menu_id, group_id, name) do nothing;

-- Gula: semua minuman
insert into public.menu_variants (menu_id, group_id, name, price_delta, is_default)
select m.id, g.id, o.name, 0, o.is_default
from _seed_menu s
join public.menus m on m.name = s.name
join public.variant_groups g on g.name = 'Gula'
cross join (values ('Normal', true), ('Kurang', false), ('Tanpa', false)) as o(name, is_default)
where s.temp_mode <> 'none'
on conflict (menu_id, group_id, name) do nothing;

-- Es: hanya menu yang bisa disajikan dingin (di aplikasi tampil saat Suhu = Dingin)
insert into public.menu_variants (menu_id, group_id, name, price_delta, is_default)
select m.id, g.id, o.name, 0, o.is_default
from _seed_menu s
join public.menus m on m.name = s.name
join public.variant_groups g on g.name = 'Es'
cross join (values ('Normal', true), ('Sedikit', false), ('Tanpa', false)) as o(name, is_default)
where s.temp_mode in ('both', 'cold_only')
on conflict (menu_id, group_id, name) do nothing;

-- Tambahan: hanya menu dengan addons = true
insert into public.menu_variants (menu_id, group_id, name, price_delta, is_default)
select m.id, g.id, o.name, o.delta, false
from _seed_menu s
join public.menus m on m.name = s.name
join public.variant_groups g on g.name = 'Tambahan'
cross join (values ('Extra shot', 5000), ('Susu oat', 7000), ('Whipped cream', 4000)) as o(name, delta)
where s.addons
on conflict (menu_id, group_id, name) do nothing;

commit;