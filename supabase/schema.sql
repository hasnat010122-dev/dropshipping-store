-- FetchWow production schema
-- Run once in Supabase Dashboard -> SQL Editor -> New query.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  price bigint not null check (price >= 0),
  compare_at bigint check (compare_at is null or compare_at >= 0),
  category text not null,
  badge text,
  image text not null,
  description text,
  stock integer not null default 0 check (stock >= 0),
  supplier_id text,
  supplier_product_url text,
  supplier_cost bigint check (supplier_cost is null or supplier_cost >= 0),
  publication_status text not null default 'draft' check (publication_status in ('draft','approved','published')),
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id text primary key,
  name text not null,
  platform text not null,
  contact_name text,
  phone text,
  email text,
  website text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  auth_provider text not null check (auth_provider in ('google','email')),
  addresses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  user_id text,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text not null,
  payment_method text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal bigint not null check (subtotal >= 0),
  coupon_code text,
  discount bigint not null default 0 check (discount >= 0),
  total bigint not null check (total >= 0),
  status text not null default 'pending',
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected')),
  approved_at timestamptz,
  approved_by text,
  supplier_id text,
  fulfillment_status text not null default 'not_ordered' check (fulfillment_status in ('not_ordered','ordered_from_supplier','shipped_by_supplier','delivered')),
  supplier_tracking_number text,
  supplier_tracking_url text,
  fulfillment_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id text primary key,
  code text not null unique,
  type text not null check (type in ('percent','fixed')),
  value numeric not null check (value > 0),
  active boolean not null default true,
  usage_limit integer,
  used_count integer not null default 0 check (used_count >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.returns (
  id text primary key,
  order_id text not null,
  customer_name text not null,
  phone text not null,
  item_id text not null,
  item_name text not null,
  request_type text not null check (request_type in ('refund','exchange')),
  reason text not null,
  comments text,
  status text not null default 'requested' check (status in ('requested','approved','rejected','refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id text primary key,
  type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.otp_codes (
  id text primary key,
  email text not null,
  code_hash text not null,
  used boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists products_publication_idx on public.products(publication_status, created_at desc);
create index if not exists products_category_idx on public.products(category);
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists activities_created_idx on public.activities(created_at desc);
create index if not exists otp_email_idx on public.otp_codes(email, created_at desc);
create index if not exists returns_order_idx on public.returns(order_id);

-- Browser clients receive no direct table access. FetchWow's Next.js server uses
-- the secret server key and exposes only validated/redacted API responses.
alter table public.products enable row level security;
alter table public.suppliers enable row level security;
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.coupons enable row level security;
alter table public.returns enable row level security;
alter table public.activities enable row level security;
alter table public.otp_codes enable row level security;

-- Public product images are readable by URL, but uploads/deletes are server-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Atomic coupon increment used after successful order creation.
create or replace function public.increment_coupon_usage(coupon_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.coupons set used_count = used_count + 1 where id = coupon_id;
$$;
revoke all on function public.increment_coupon_usage(text) from public, anon, authenticated;
grant execute on function public.increment_coupon_usage(text) to service_role;
