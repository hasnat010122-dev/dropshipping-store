-- Supabase Dashboard -> SQL Editor -> New query -> paste and Run.
alter table public.products
  add column if not exists images jsonb not null default '[]'::jsonb;

alter table public.products
  add column if not exists colors jsonb not null default '[]'::jsonb;

update public.products
set images = jsonb_build_array(image)
where images = '[]'::jsonb;

-- Verification: this must return rows named images and colors.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'products'
  and column_name in ('images', 'colors')
order by column_name;
