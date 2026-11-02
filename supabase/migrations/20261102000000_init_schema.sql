-- Migrasi skema dasar Seruput.
BEGIN;

-- Enum untuk peran pengguna, tipe pesanan, pembayaran, dan status pesanan.
CREATE TYPE user_role AS ENUM ('customer', 'owner');
CREATE TYPE order_type AS ENUM ('dine_in', 'take_away');
CREATE TYPE payment_method AS ENUM ('cash', 'qris_sim');
CREATE TYPE payment_status AS ENUM ('pending', 'paid');
CREATE TYPE order_status AS ENUM ('received', 'processing', 'ready', 'completed');

-- Profil pengguna yang terhubung ke akun Supabase Auth.
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Kategori menu.
CREATE TABLE categories (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0
);

-- Daftar menu kafe.
CREATE TABLE menus (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id bigint NOT NULL REFERENCES categories(id),
  name text NOT NULL,
  description text,
  base_price integer NOT NULL CHECK (base_price >= 0),
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Grup pilihan varian menu.
CREATE TABLE variant_groups (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  selection_type text NOT NULL CHECK (selection_type IN ('single', 'multiple')),
  is_required boolean NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

-- Pilihan varian pada setiap menu.
CREATE TABLE menu_variants (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  menu_id bigint NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  group_id bigint NOT NULL REFERENCES variant_groups(id),
  name text NOT NULL,
  price_delta integer NOT NULL DEFAULT 0 CHECK (price_delta >= 0),
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (menu_id, group_id, name)
);

-- Pesanan pelanggan.
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES profiles(id),
  order_type order_type NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  status order_status NOT NULL DEFAULT 'received',
  notes text,
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Item yang tersimpan di dalam pesanan.
CREATE TABLE order_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id bigint REFERENCES menus(id) ON DELETE SET NULL,
  menu_name text NOT NULL,
  unit_price integer NOT NULL CHECK (unit_price >= 0),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  subtotal integer NOT NULL
);

-- Varian yang dipilih untuk setiap item pesanan.
CREATE TABLE order_item_variants (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_item_id bigint NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  menu_variant_id bigint REFERENCES menu_variants(id) ON DELETE SET NULL,
  group_name text NOT NULL,
  option_name text NOT NULL,
  price_delta integer NOT NULL
);

-- Penghitung nomor pesanan per tanggal.
CREATE TABLE order_counters (
  order_date date PRIMARY KEY,
  last_number integer NOT NULL DEFAULT 0
);

-- Indeks untuk pencarian pesanan, menu, dan item pesanan.
CREATE INDEX orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
CREATE INDEX orders_status_idx ON orders (status);
CREATE INDEX menus_category_id_is_active_idx ON menus (category_id, is_active);
CREATE INDEX menu_variants_menu_id_idx ON menu_variants (menu_id);
CREATE INDEX order_items_order_id_idx ON order_items (order_id);

-- Fungsi dan trigger untuk memperbarui waktu perubahan pesanan.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- RLS diaktifkan tanpa policy agar akses default tetap tertutup.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_counters ENABLE ROW LEVEL SECURITY;

COMMIT;
