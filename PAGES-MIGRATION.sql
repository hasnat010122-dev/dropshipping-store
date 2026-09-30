-- Adds the editable storefront pages (About Us, Contact Us).
-- Run once in Supabase Dashboard -> SQL Editor -> New query.

create table if not exists public.site_pages (
  slug text primary key check (slug in ('about','contact')),
  title text not null,
  content text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_pages enable row level security;

notify pgrst, 'reload schema';

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
and table_name = 'site_pages';
