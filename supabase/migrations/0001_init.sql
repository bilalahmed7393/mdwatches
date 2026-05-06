-- MD Watches — initial schema
-- Tables, enums, functions, triggers, indexes.
-- RLS policies live in 0002_rls.sql.

create extension if not exists "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────────────────
do $$ begin
  create type condition_grade as enum ('Mint', 'Excellent', 'Very Good', 'Good', 'Fair');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('active', 'sold', 'reserved', 'draft');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending',
    'payment_submitted',
    'payment_confirmed',
    'shipped',
    'delivered',
    'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type offer_status as enum ('pending', 'accepted', 'rejected', 'countered');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_role as enum ('owner', 'staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type discount_type as enum ('percentage', 'fixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_pref as enum ('email', 'whatsapp', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type setting_type as enum ('text', 'image', 'json', 'boolean');
exception when duplicate_object then null; end $$;

-- ─── updated_at trigger helper ───────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─── collections ─────────────────────────────────────────────────────────
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── products ────────────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text not null,
  model text,
  reference_number text,
  description text,
  price numeric(12,2) not null check (price >= 0),
  offer_price numeric(12,2) check (offer_price is null or offer_price >= 0),
  condition_grade condition_grade not null default 'Excellent',
  category text,
  case_size_mm numeric(5,2),
  movement_type text,
  year int check (year is null or (year between 1900 and 2100)),
  has_box boolean not null default false,
  has_papers boolean not null default false,
  stock_quantity int not null default 1 check (stock_quantity >= 0),
  status product_status not null default 'draft',
  views_count int not null default 0,
  is_featured boolean not null default false,
  collection_id uuid references collections(id) on delete set null,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_status_idx on products(status);
create index if not exists products_brand_idx on products(brand);
create index if not exists products_collection_idx on products(collection_id);
create index if not exists products_created_at_idx on products(created_at desc);
create index if not exists products_featured_idx on products(is_featured) where is_featured;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();

-- ─── product_images ──────────────────────────────────────────────────────
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  display_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx on product_images(product_id, display_order);
create unique index if not exists product_images_one_primary on product_images(product_id) where is_primary;

-- ─── product_certificates ───────────────────────────────────────────────
create table if not exists product_certificates (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  certificate_url text not null,
  certificate_type text,
  created_at timestamptz not null default now()
);

create index if not exists product_certificates_product_idx on product_certificates(product_id);

-- ─── orders ──────────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  product_id uuid not null references products(id) on delete restrict,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address text not null,
  offered_price numeric(12,2),
  final_price numeric(12,2) not null check (final_price >= 0),
  status order_status not null default 'pending',
  payment_proof_url text,
  tracking_number text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on orders(status);
create index if not exists orders_product_idx on orders(product_id);
create index if not exists orders_created_at_idx on orders(created_at desc);
create index if not exists orders_email_idx on orders(customer_email);

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- ─── offers ──────────────────────────────────────────────────────────────
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  offered_price numeric(12,2) not null check (offered_price > 0),
  message text,
  status offer_status not null default 'pending',
  admin_response text,
  created_at timestamptz not null default now()
);

create index if not exists offers_product_idx on offers(product_id);
create index if not exists offers_status_idx on offers(status);

-- ─── waitlist ────────────────────────────────────────────────────────────
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  notification_preference notification_pref not null default 'email',
  is_general_newsletter boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_product_idx on waitlist(product_id);
create index if not exists waitlist_email_idx on waitlist(customer_email);

-- ─── site_settings ───────────────────────────────────────────────────────
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  type setting_type not null default 'text',
  section text not null default 'general',
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_updated_at on site_settings;
create trigger site_settings_updated_at before update on site_settings
  for each row execute function set_updated_at();

-- ─── analytics_events ────────────────────────────────────────────────────
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  product_id uuid references products(id) on delete set null,
  session_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_type_idx on analytics_events(event_type);
create index if not exists analytics_events_product_idx on analytics_events(product_id);
create index if not exists analytics_events_created_at_idx on analytics_events(created_at desc);

-- ─── admin_profiles ──────────────────────────────────────────────────────
create table if not exists admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role admin_role not null default 'staff',
  full_name text,
  created_at timestamptz not null default now()
);

-- ─── promo_codes ─────────────────────────────────────────────────────────
create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type discount_type not null,
  discount_value numeric(12,2) not null check (discount_value > 0),
  min_order_value numeric(12,2),
  max_uses int,
  current_uses int not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists promo_codes_active_idx on promo_codes(is_active) where is_active;

-- ─── instagram_posts ─────────────────────────────────────────────────────
create table if not exists instagram_posts (
  id uuid primary key default gen_random_uuid(),
  instagram_id text not null unique,
  media_url text not null,
  thumbnail_url text,
  caption text,
  permalink text,
  posted_at timestamptz,
  is_imported boolean not null default false,
  linked_product_id uuid references products(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists instagram_posts_imported_idx on instagram_posts(is_imported);

-- ─── product view counter (callable via API) ─────────────────────────────
create or replace function increment_product_views(p_slug text)
returns void language sql security definer as $$
  update products set views_count = views_count + 1 where slug = p_slug;
$$;

revoke all on function increment_product_views(text) from public;
grant execute on function increment_product_views(text) to anon, authenticated;

-- ─── is_admin helper (used by RLS policies) ──────────────────────────────
create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from admin_profiles where id = auth.uid()
  );
$$;

create or replace function is_owner()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from admin_profiles where id = auth.uid() and role = 'owner'
  );
$$;

-- ─── dashboard stats view ────────────────────────────────────────────────
create or replace view admin_dashboard_stats as
select
  (select count(*) from products where status = 'active') as active_products,
  (select count(*) from products where status = 'sold') as sold_products,
  (select count(*) from orders where status = 'pending') as pending_orders,
  (select count(*) from orders where date_trunc('day', created_at) = date_trunc('day', now())) as orders_today,
  (select count(*) from offers where status = 'pending') as pending_offers,
  (select coalesce(sum(final_price), 0) from orders where status in ('payment_confirmed', 'shipped', 'delivered')) as confirmed_revenue;
