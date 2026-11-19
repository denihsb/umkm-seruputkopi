-- Tetapkan satu akun Supabase Auth sebagai pemilik dashboard Seruput.
BEGIN;

UPDATE public.profiles AS p
SET role = 'owner'::public.user_role
FROM auth.users AS u
WHERE p.id = u.id
  AND lower(u.email) = lower('denianugra8@gmail.com');

COMMIT;
