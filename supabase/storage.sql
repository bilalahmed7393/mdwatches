-- MD Watches — Storage bucket setup
-- Run after migrations. Buckets are created via Supabase dashboard or CLI:
--   supabase storage create product-images --public
--   supabase storage create site-assets --public
--   supabase storage create product-certificates  (private; signed URLs only)
--   supabase storage create payment-proofs        (private; signed URLs only)
-- Then run this file to apply storage RLS.

-- Public buckets — anyone can read; only admins can write.
do $$
declare
  pub_buckets text[] := array['product-images', 'site-assets'];
  priv_buckets text[] := array['product-certificates', 'payment-proofs'];
  b text;
begin
  foreach b in array pub_buckets loop
    -- Public read
    execute format($p$
      drop policy if exists %1$I on storage.objects;
      create policy %1$I on storage.objects
        for select using (bucket_id = %2$L);
    $p$, b || '_public_read', b);
    -- Admin write
    execute format($p$
      drop policy if exists %1$I on storage.objects;
      create policy %1$I on storage.objects
        for all using (bucket_id = %2$L and is_admin())
        with check (bucket_id = %2$L and is_admin());
    $p$, b || '_admin_write', b);
  end loop;

  foreach b in array priv_buckets loop
    -- Admin-only access
    execute format($p$
      drop policy if exists %1$I on storage.objects;
      create policy %1$I on storage.objects
        for all using (bucket_id = %2$L and is_admin())
        with check (bucket_id = %2$L and is_admin());
    $p$, b || '_admin_only', b);
  end loop;
end $$;

-- Allow anonymous insert to payment-proofs (customers upload proof on /order/[id]).
-- Reads are still admin-only.
drop policy if exists payment_proofs_public_insert on storage.objects;
create policy payment_proofs_public_insert on storage.objects
  for insert with check (bucket_id = 'payment-proofs');
