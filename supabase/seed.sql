
-- Seed data awal untuk aplikasi Seruput.

BEGIN;

-- 1. Memasukkan kategori menu.
INSERT INTO categories (name, sort_order)
VALUES
  ('Kopi', 1),
  ('Non-Kopi', 2)
ON CONFLICT (name)
DO UPDATE SET sort_order = EXCLUDED.sort_order;


-- 2. Menyiapkan data menu contoh.
WITH sample_menus (category_name, name, description, base_price) AS (
  VALUES
    ('Kopi', 'Kopi Susu Gula Aren', 'Kopi susu dengan gula aren.', 18000),
    ('Kopi', 'Americano', 'Kopi espresso dengan air.', 15000),
    ('Kopi', 'Cafe Latte', 'Espresso dengan susu.', 20000),
    ('Kopi', 'Cappuccino', 'Espresso dengan susu dan foam.', 20000),
    ('Non-Kopi', 'Matcha Latte', 'Minuman matcha dengan susu.', 22000),
    ('Non-Kopi', 'Es Teh', 'Teh dingin yang menyegarkan.', 8000)
)

-- 3. Memasukkan menu ke tabel menus.
INSERT INTO menus (category_id, name, description, base_price)
SELECT
  c.id,
  s.name,
  s.description,
  s.base_price
FROM sample_menus s
JOIN categories c ON c.name = s.category_name
WHERE NOT EXISTS (
  SELECT 1
  FROM menus m
  WHERE m.category_id = c.id
    AND m.name = s.name
);

COMMIT;

