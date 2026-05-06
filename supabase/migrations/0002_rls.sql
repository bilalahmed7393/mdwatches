-- MD Watches — Row Level Security policies
-- Public users (anon) get carefully scoped read + insert.
-- Admins (authed users with admin_profiles row) get full access.

-- ─── enable RLS ──────────────────────────────────────────────────────────
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_certificates enable row level security;
alter table collections enable row level security;
alter table orders enable row level security;
alter table offers enable row level security;
alter table waitlist enable row level security;
alter table site_settings enable row level security;
alter table analytics_events enable row level security;
alter table admin_profiles enable row level security;
alter table promo_codes enable row level security;
alter table instagram_posts enable row level security;

-- ─── products ────────────────────────────────────────────────────────────
drop policy if exists products_public_read on products;
create policy products_public_read on products
  for select using (status in ('active', 'sold', 'reserved'));

drop policy if exists products_admin_all on products;
create policy products_admin_all on products
  for all using (is_admin()) with check (is_admin());

-- ─── product_images ──────────────────────────────────────────────────────
drop policy if exists product_images_public_read on product_images;
create policy product_images_public_read on product_images
  for select using (
    exists (select 1 from products p where p.id = product_id and p.status in ('active', 'sold', 'reserved'))
  );

drop policy if exists product_images_admin_all on product_images;
create policy product_images_admin_all on product_images
  for all using (is_admin()) with check (is_admin());

-- ─── product_certificates ────────────────────────────────────────────────
drop policy if exists product_certificates_public_read on product_certificates;
create policy product_certificates_public_read on product_certificates
  for select using (
    exists (select 1 from products p where p.id = product_id and p.status in ('active', 'sold', 'reserved'))
  );

drop policy if exists product_certificates_admin_all on product_certificates;
create policy product_certificates_admin_all on product_certificates
  for all using (is_admin()) with check (is_admin());

-- ─── collections ─────────────────────────────────────────────────────────
drop policy if exists collections_public_read on collections;
create policy collections_public_read on collections
  for select using (is_active);

drop policy if exists collections_admin_all on collections;
create policy collections_admin_all on collections
  for all using (is_admin()) with check (is_admin());

-- ─── orders ──────────────────────────────────────────────────────────────
-- Public can insert (place order); reads are admin-only.
-- Customer access to their own order is gated by knowing the order_number (handled in API layer with service role + token check).
drop policy if exists orders_public_insert on orders;
create policy orders_public_insert on orders
  for insert with check (true);

drop policy if exists orders_admin_all on orders;
create policy orders_admin_all on orders
  for all using (is_admin()) with check (is_admin());

-- ─── offers ──────────────────────────────────────────────────────────────
drop policy if exists offers_public_insert on offers;
create policy offers_public_insert on offers
  for insert with check (true);

drop policy if exists offers_admin_all on offers;
create policy offers_admin_all on offers
  for all using (is_admin()) with check (is_admin());

-- ─── waitlist ────────────────────────────────────────────────────────────
drop policy if exists waitlist_public_insert on waitlist;
create policy waitlist_public_insert on waitlist
  for insert with check (true);

drop policy if exists waitlist_admin_all on waitlist;
create policy waitlist_admin_all on waitlist
  for all using (is_admin()) with check (is_admin());

-- ─── site_settings ───────────────────────────────────────────────────────
drop policy if exists site_settings_public_read on site_settings;
create policy site_settings_public_read on site_settings
  for select using (true);

drop policy if exists site_settings_admin_write on site_settings;
create policy site_settings_admin_write on site_settings
  for all using (is_admin()) with check (is_admin());

-- ─── analytics_events ────────────────────────────────────────────────────
drop policy if exists analytics_events_public_insert on analytics_events;
create policy analytics_events_public_insert on analytics_events
  for insert with check (true);

drop policy if exists analytics_events_admin_read on analytics_events;
create policy analytics_events_admin_read on analytics_events
  for select using (is_admin());

-- ─── admin_profiles (owner-only) ─────────────────────────────────────────
drop policy if exists admin_profiles_self_read on admin_profiles;
create policy admin_profiles_self_read on admin_profiles
  for select using (auth.uid() = id or is_admin());

drop policy if exists admin_profiles_owner_write on admin_profiles;
create policy admin_profiles_owner_write on admin_profiles
  for all using (is_owner()) with check (is_owner());

-- ─── promo_codes ─────────────────────────────────────────────────────────
drop policy if exists promo_codes_admin_all on promo_codes;
create policy promo_codes_admin_all on promo_codes
  for all using (is_admin()) with check (is_admin());

-- public reads are NOT allowed; codes are validated server-side via API.

-- ─── instagram_posts ─────────────────────────────────────────────────────
drop policy if exists instagram_posts_public_read on instagram_posts;
create policy instagram_posts_public_read on instagram_posts
  for select using (true);

drop policy if exists instagram_posts_admin_write on instagram_posts;
create policy instagram_posts_admin_write on instagram_posts
  for all using (is_admin()) with check (is_admin());
