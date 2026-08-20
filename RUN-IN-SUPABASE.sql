alter table public.products
add column if not exists color_images jsonb not null default '{}'::jsonb;

notify pgrst, 'reload schema';

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
and table_name = 'products'
and column_name = 'color_images';
