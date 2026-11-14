-- RPC untuk membuat pesanan pelanggan secara atomik dan tervalidasi di server.
BEGIN;

DROP FUNCTION IF EXISTS public.create_order(public.order_type, public.payment_method, text, jsonb);

CREATE OR REPLACE FUNCTION public.create_order(
  p_order_type public.order_type,
  p_payment_method public.payment_method,
  p_notes text,
  p_items jsonb
)
RETURNS TABLE (
  order_id uuid,
  order_number text,
  total_amount integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_customer_id uuid := auth.uid();
  v_order_date date := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  v_order_id uuid;
  v_order_number text;
  v_sequence integer;
  v_total integer := 0;
  v_item jsonb;
  v_menu_id bigint;
  v_quantity integer;
  v_unit_price integer;
  v_option_ids jsonb;
  v_option_total integer;
  v_option_count integer;
  v_order_item_id bigint;
  v_option_id bigint;
BEGIN
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Kamu harus masuk sebelum membuat pesanan.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = v_customer_id
  ) THEN
    RAISE EXCEPTION 'Profil pelanggan tidak ditemukan.';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Keranjang pesanan kosong.';
  END IF;

  IF p_notes IS NOT NULL AND char_length(p_notes) > 200 THEN
    RAISE EXCEPTION 'Catatan maksimal 200 karakter.';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_menu_id := (v_item->>'menu_id')::bigint;
    v_quantity := (v_item->>'quantity')::integer;
    v_option_ids := COALESCE(v_item->'option_ids', '[]'::jsonb);

    IF v_quantity IS NULL OR v_quantity < 1 OR v_quantity > 20 THEN
      RAISE EXCEPTION 'Jumlah menu harus antara 1 dan 20.';
    END IF;

    IF jsonb_typeof(v_option_ids) <> 'array' THEN
      RAISE EXCEPTION 'Pilihan menu tidak valid.';
    END IF;

    SELECT m.base_price
    INTO v_unit_price
    FROM public.menus AS m
    WHERE m.id = v_menu_id
      AND m.is_active;

    IF v_unit_price IS NULL THEN
      RAISE EXCEPTION 'Menu tidak tersedia.';
    END IF;

    SELECT
      COALESCE(SUM(mv.price_delta), 0),
      COUNT(DISTINCT mv.id)
    INTO v_option_total, v_option_count
    FROM public.menu_variants AS mv
    WHERE mv.menu_id = v_menu_id
      AND mv.is_active
      AND mv.id IN (
        SELECT value::bigint
        FROM jsonb_array_elements_text(v_option_ids)
      );

    IF v_option_count <> jsonb_array_length(v_option_ids) THEN
      RAISE EXCEPTION 'Pilihan menu tidak tersedia.';
    END IF;

    v_unit_price := v_unit_price + v_option_total;
    v_total := v_total + (v_unit_price * v_quantity);
  END LOOP;

  INSERT INTO public.order_counters (order_date, last_number)
  VALUES (v_order_date, 1)
  ON CONFLICT (order_date)
  DO UPDATE SET last_number = public.order_counters.last_number + 1
  RETURNING last_number INTO v_sequence;

  v_order_number := format(
    'SRP-%s-%s',
    to_char(v_order_date, 'YYYYMMDD'),
    lpad(v_sequence::text, 4, '0')
  );

  INSERT INTO public.orders (
    order_number,
    customer_id,
    order_type,
    payment_method,
    notes,
    total_amount
  )
  VALUES (
    v_order_number,
    v_customer_id,
    p_order_type,
    p_payment_method,
    NULLIF(trim(p_notes), ''),
    v_total
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_menu_id := (v_item->>'menu_id')::bigint;
    v_quantity := (v_item->>'quantity')::integer;
    v_option_ids := COALESCE(v_item->'option_ids', '[]'::jsonb);

    SELECT m.base_price + COALESCE(SUM(mv.price_delta), 0)
    INTO v_unit_price
    FROM public.menus AS m
    LEFT JOIN public.menu_variants AS mv
      ON mv.menu_id = m.id
      AND mv.is_active
      AND mv.id IN (
        SELECT value::bigint
        FROM jsonb_array_elements_text(v_option_ids)
      )
    WHERE m.id = v_menu_id
      AND m.is_active
    GROUP BY m.base_price;

    INSERT INTO public.order_items (
      order_id,
      menu_id,
      menu_name,
      unit_price,
      quantity,
      subtotal
    )
    SELECT
      v_order_id,
      m.id,
      m.name,
      v_unit_price,
      v_quantity,
      v_unit_price * v_quantity
    FROM public.menus AS m
    WHERE m.id = v_menu_id;

    v_order_item_id := currval(pg_get_serial_sequence('public.order_items', 'id'));

    FOR v_option_id IN
      SELECT value::bigint
      FROM jsonb_array_elements_text(v_option_ids)
    LOOP
      INSERT INTO public.order_item_variants (
        order_item_id,
        menu_variant_id,
        group_name,
        option_name,
        price_delta
      )
      SELECT
        v_order_item_id,
        mv.id,
        vg.name,
        mv.name,
        mv.price_delta
      FROM public.menu_variants AS mv
      JOIN public.variant_groups AS vg ON vg.id = mv.group_id
      WHERE mv.id = v_option_id
        AND mv.menu_id = v_menu_id
        AND mv.is_active;
    END LOOP;
  END LOOP;

  RETURN QUERY SELECT v_order_id, v_order_number, v_total;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order(public.order_type, public.payment_method, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(public.order_type, public.payment_method, text, jsonb) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
