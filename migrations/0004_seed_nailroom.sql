-- 23 Nailroom – Seed data for development
-- Inserts studio, example services, and admin membership for provided profile id

-- 1) Studio anlegen (idempotent über slug)
insert into public.studios (id, name, slug, timezone, default_currency, created_by)
values (
  gen_random_uuid(),
  '23 Nailroom Bali',
  '23-nailroom-bali',
  'Asia/Makassar',
  'EUR',
  '2f0a240d-1835-44a0-ba53-e2fe8a85805e'::uuid
)
on conflict (slug) do nothing;

-- 2) Beispiel-Services für dieses Studio (idempotent per (studio_id,name))
insert into public.services (id, studio_id, name, duration_min, price_cents, currency)
values
  (gen_random_uuid(), (select id from public.studios where slug = '23-nailroom-bali'), 'Gel Full Set', 90, 6500, 'EUR'),
  (gen_random_uuid(), (select id from public.studios where slug = '23-nailroom-bali'), 'Refill', 60, 4500, 'EUR'),
  (gen_random_uuid(), (select id from public.studios where slug = '23-nailroom-bali'), 'Removal', 30, 2000, 'EUR'),
  (gen_random_uuid(), (select id from public.studios where slug = '23-nailroom-bali'), 'Nail Art Add-on', 20, 1500, 'EUR')
on conflict (studio_id, name) do nothing;

-- 3) Dich als Admin-Mitglied hinzufügen (idempotent per PK)
insert into public.studio_members (studio_id, profile_id, role)
values (
  (select id from public.studios where slug = '23-nailroom-bali'),
  '2f0a240d-1835-44a0-ba53-e2fe8a85805e'::uuid,
  'admin'
)
on conflict (studio_id, profile_id) do nothing;
