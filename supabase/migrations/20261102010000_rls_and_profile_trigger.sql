-- Migrasi policy RLS, hak akses, dan trigger profil Seruput.
BEGIN;

-- Helper untuk memeriksa apakah pengguna aktif adalah owner.
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'owner'::public.user_role
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_owner() FROM public;
GRANT EXECUTE ON FUNCTION public.is_owner() TO authenticated;

-- Membuat profil customer secara otomatis setelah akun Auth dibuat.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      split_part(NEW.email, '@', 1)
    ),
    'customer'::public.user_role
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Membatasi hak perubahan profil agar role tidak dapat diubah pengguna.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;

-- Membatasi perubahan langsung pada pesanan oleh client.
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM anon, authenticated;
GRANT UPDATE (status, payment_status) ON public.orders TO authenticated;

-- Item pesanan hanya dibaca melalui policy, tanpa perubahan langsung oleh client.
REVOKE INSERT, UPDATE, DELETE ON public.order_items FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.order_item_variants FROM anon, authenticated;

-- Counter pesanan tidak dapat diakses langsung oleh client.
REVOKE ALL ON public.order_counters FROM anon, authenticated;

-- Data katalog hanya dapat dikelola owner; penghapusan menu dilakukan dengan menonaktifkan.
REVOKE INSERT, UPDATE, DELETE ON public.categories, public.variant_groups FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.menus, public.menu_variants FROM anon;

-- Policy profil: pengguna membaca dan memperbarui profil sendiri, owner membaca semua.
CREATE POLICY profiles_select_own
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY profiles_select_owner
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_owner());

CREATE POLICY profiles_update_own
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy kategori dan grup varian: katalog dapat dibaca publik, perubahan oleh owner.
CREATE POLICY categories_select_public
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY categories_insert_owner
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (public.is_owner());

CREATE POLICY categories_update_owner
ON public.categories
FOR UPDATE
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

CREATE POLICY categories_delete_owner
ON public.categories
FOR DELETE
TO authenticated
USING (public.is_owner());

CREATE POLICY variant_groups_select_public
ON public.variant_groups
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY variant_groups_insert_owner
ON public.variant_groups
FOR INSERT
TO authenticated
WITH CHECK (public.is_owner());

CREATE POLICY variant_groups_update_owner
ON public.variant_groups
FOR UPDATE
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

CREATE POLICY variant_groups_delete_owner
ON public.variant_groups
FOR DELETE
TO authenticated
USING (public.is_owner());

-- Policy menu: publik hanya melihat menu aktif, owner dapat melihat dan mengelola semuanya.
CREATE POLICY menus_select_active
ON public.menus
FOR SELECT
TO anon, authenticated
USING (is_active);

CREATE POLICY menus_select_owner
ON public.menus
FOR SELECT
TO authenticated
USING (public.is_owner());

CREATE POLICY menus_insert_owner
ON public.menus
FOR INSERT
TO authenticated
WITH CHECK (public.is_owner());

CREATE POLICY menus_update_owner
ON public.menus
FOR UPDATE
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- Policy varian: publik hanya melihat varian aktif dari menu aktif.
CREATE POLICY menu_variants_select_active
ON public.menu_variants
FOR SELECT
TO anon, authenticated
USING (
  is_active
  AND EXISTS (
    SELECT 1
    FROM public.menus AS m
    WHERE m.id = menu_id
      AND m.is_active
  )
);

CREATE POLICY menu_variants_select_owner
ON public.menu_variants
FOR SELECT
TO authenticated
USING (public.is_owner());

CREATE POLICY menu_variants_insert_owner
ON public.menu_variants
FOR INSERT
TO authenticated
WITH CHECK (public.is_owner());

CREATE POLICY menu_variants_update_owner
ON public.menu_variants
FOR UPDATE
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- Policy pesanan: customer membaca pesanannya, owner membaca dan memperbarui semua pesanan.
CREATE POLICY orders_select_own
ON public.orders
FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

CREATE POLICY orders_select_owner
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_owner());

CREATE POLICY orders_update_owner
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_owner())
WITH CHECK (public.is_owner());

-- Policy item pesanan: customer melihat item miliknya, owner melihat semua item.
CREATE POLICY order_items_select_own
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders AS o
    WHERE o.id = order_id
      AND o.customer_id = auth.uid()
  )
);

CREATE POLICY order_items_select_owner
ON public.order_items
FOR SELECT
TO authenticated
USING (public.is_owner());

CREATE POLICY order_item_variants_select_own
ON public.order_item_variants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.order_items AS oi
    JOIN public.orders AS o ON o.id = oi.order_id
    WHERE oi.id = order_item_id
      AND o.customer_id = auth.uid()
  )
);

CREATE POLICY order_item_variants_select_owner
ON public.order_item_variants
FOR SELECT
TO authenticated
USING (public.is_owner());

-- Order counter sengaja tidak memiliki policy.
COMMIT;
