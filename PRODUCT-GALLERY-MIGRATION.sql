-- Run once in Supabase Dashboard -> SQL Editor -> New query.
alter table public.products
  add column if not exists images jsonb not null default '[]'::jsonb;

alter table public.products
  add column if not exists colors jsonb not null default '[]'::jsonb;

-- Preserve every existing product's current image as its first gallery image.
update public.products
set images = jsonb_build_array(image)
where images = '[]'::jsonb;
