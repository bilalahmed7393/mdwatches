-- MD Watches — seed data for local dev and demo
-- Run after migrations: supabase db reset (which auto-runs migrations + seed.sql)

-- ─── collections ─────────────────────────────────────────────────────────
insert into collections (name, slug, description, display_order, is_active) values
  ('Luxury', 'luxury', 'High-end pieces from heritage maisons.', 1, true),
  ('Vintage', 'vintage', 'Watches with history. Pre-1990 references.', 2, true),
  ('Casual', 'casual', 'Daily-wearable, quietly excellent.', 3, true),
  ('Dress', 'dress', 'Slim, formal, timeless.', 4, true),
  ('Sport', 'sport', 'Divers, chronographs, GMTs.', 5, true),
  ('Funky / Streetwear', 'funky-streetwear', 'Bold, colourful, unmistakable.', 6, true)
on conflict (slug) do nothing;

-- ─── site_settings (CMS) ─────────────────────────────────────────────────
insert into site_settings (key, value, type, section) values
  ('hero.headline', 'Stories on the wrist.', 'text', 'homepage'),
  ('hero.subtext', 'Hand-picked pre-loved watches. Authenticated. Ready to ship.', 'text', 'homepage'),
  ('hero.cta_label', 'Shop the collection', 'text', 'homepage'),
  ('hero.cta_href', '/shop', 'text', 'homepage'),
  ('hero.image_url', '', 'image', 'homepage'),
  ('about.body', 'MD Watches curates pre-loved timepieces with stories worth telling. Every watch is inspected, authenticated, and photographed in detail.', 'text', 'about'),
  ('contact.whatsapp', '+10000000000', 'text', 'contact'),
  ('contact.email', 'hello@mdwatches.example', 'text', 'contact'),
  ('contact.instagram_url', 'https://instagram.com/mdwatches.co', 'text', 'contact'),
  ('bank.account_name', 'TODO: owner input', 'text', 'bank'),
  ('bank.account_number', 'TODO: owner input', 'text', 'bank'),
  ('bank.bank_name', 'TODO: owner input', 'text', 'bank'),
  ('bank.swift_code', 'TODO: owner input', 'text', 'bank'),
  ('bank.instructions', 'Please use your order reference number as the transfer description.', 'text', 'bank'),
  ('seo.default_title', 'MD Watches — Pre-Loved Timepieces', 'text', 'seo'),
  ('seo.default_description', 'Curated pre-loved watches — luxury, vintage, and standout streetwear timepieces.', 'text', 'seo'),
  ('seo.og_image', '', 'image', 'seo'),
  ('announcement.enabled', 'true', 'boolean', 'announcement'),
  ('announcement.text', 'Free worldwide shipping on orders over $2,000.', 'text', 'announcement'),
  ('footer.tagline', 'Curated. Authenticated. Worn-in.', 'text', 'footer'),
  ('condition.mint', 'As-new. No visible wear.', 'text', 'conditions'),
  ('condition.excellent', 'Light wear, no significant marks.', 'text', 'conditions'),
  ('condition.very_good', 'Honest wear, fully serviced.', 'text', 'conditions'),
  ('condition.good', 'Visible patina. Mechanically sound.', 'text', 'conditions'),
  ('condition.fair', 'Heavy wear. Priced accordingly.', 'text', 'conditions')
on conflict (key) do nothing;

-- ─── sample products ─────────────────────────────────────────────────────
do $$
declare
  c_luxury uuid := (select id from collections where slug='luxury');
  c_vintage uuid := (select id from collections where slug='vintage');
  c_casual uuid := (select id from collections where slug='casual');
  c_sport uuid := (select id from collections where slug='sport');
  c_funky uuid := (select id from collections where slug='funky-streetwear');
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
begin
  insert into products (slug, name, brand, model, reference_number, description, price, condition_grade, category, case_size_mm, movement_type, year, has_box, has_papers, stock_quantity, status, is_featured, collection_id)
  values
    ('rolex-submariner-16610', 'Rolex Submariner Date 16610', 'Rolex', 'Submariner', '16610', 'Iconic dive watch in steel. Recently serviced. No-holes case.', 9800, 'Excellent', 'Diver', 40, 'Automatic', 2003, true, true, 1, 'active', true, c_luxury)
  returning id into p1;

  insert into products (slug, name, brand, model, reference_number, description, price, condition_grade, category, case_size_mm, movement_type, year, has_box, has_papers, stock_quantity, status, is_featured, collection_id)
  values
    ('omega-speedmaster-310-30-42', 'Omega Speedmaster Professional', 'Omega', 'Speedmaster Moonwatch', '310.30.42.50.01.001', 'The Moonwatch. Hesalite crystal, manual winding caliber 3861.', 5400, 'Mint', 'Chronograph', 42, 'Manual', 2022, true, true, 1, 'active', true, c_sport)
  returning id into p2;

  insert into products (slug, name, brand, model, reference_number, description, price, condition_grade, category, case_size_mm, movement_type, year, has_box, has_papers, stock_quantity, status, is_featured, collection_id)
  values
    ('seiko-skx007-vintage', 'Seiko SKX007 (Discontinued)', 'Seiko', 'SKX007', 'SKX007J1', 'The benchmark affordable diver. Box, no papers.', 480, 'Very Good', 'Diver', 42, 'Automatic', 2018, true, false, 2, 'active', false, c_casual)
  returning id into p3;

  insert into products (slug, name, brand, model, reference_number, description, price, condition_grade, category, case_size_mm, movement_type, year, has_box, has_papers, stock_quantity, status, is_featured, collection_id)
  values
    ('casio-ga2100-black', 'G-Shock GA-2100 "CasiOak"', 'Casio', 'G-Shock', 'GA-2100-1A1', 'Octagonal cult favourite. Lightweight, indestructible.', 95, 'Mint', 'Sport', 45, 'Quartz', 2023, true, true, 5, 'active', false, c_funky)
  returning id into p4;

  insert into products (slug, name, brand, model, reference_number, description, price, condition_grade, category, case_size_mm, movement_type, year, has_box, has_papers, stock_quantity, status, is_featured, collection_id)
  values
    ('cartier-tank-must-vintage', 'Cartier Tank Must (Vintage)', 'Cartier', 'Tank Must', '590005', 'Burgundy dial Tank Must. Recently serviced. Original strap replaced.', 1850, 'Good', 'Dress', 30, 'Quartz', 1989, false, false, 1, 'sold', false, c_vintage)
  returning id into p5;

  -- Sample images (Unsplash placeholders; replace with real Supabase Storage URLs when seeding)
  insert into product_images (product_id, image_url, display_order, is_primary) values
    (p1, 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1200', 0, true),
    (p1, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200', 1, false),
    (p2, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200', 0, true),
    (p3, 'https://images.unsplash.com/photo-1606293459379-fb9b4ff45f55?w=1200', 0, true),
    (p4, 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=1200', 0, true),
    (p5, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200', 0, true);
end $$;
