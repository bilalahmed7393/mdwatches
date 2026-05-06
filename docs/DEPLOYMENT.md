# Deployment Guide — MD Watches

End-to-end steps to deploy this codebase to production using **Vercel** (web + API) and **Supabase** (database, auth, storage). One-time setup takes ~30–45 minutes.

---

## 1. Prerequisites
- A Vercel account (free tier is fine for launch).
- A Supabase account.
- The Supabase CLI installed locally: `brew install supabase/tap/supabase`.
- Domain (optional for go-live; Vercel provides a free `.vercel.app` URL by default).

---

## 2. Provision Supabase

1. Go to https://supabase.com/dashboard → **New project**.
2. Name it `md-watches-prod` (or similar). Pick the region closest to your customer base.
3. Save the auto-generated database password somewhere safe.
4. Once provisioned, copy these from **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (under "service_role" — keep this secret)

### Run database migrations

From this repo:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

This applies `supabase/migrations/0001_init.sql` and `0002_rls.sql`.

### Create storage buckets

In the Supabase dashboard → **Storage**, create the following buckets:

| Bucket | Public? |
| --- | --- |
| `product-images` | ✅ public |
| `site-assets` | ✅ public |
| `product-certificates` | ❌ private |
| `payment-proofs` | ❌ private |

Then run the storage RLS file once via the SQL Editor:

```bash
# Or copy/paste supabase/storage.sql into the SQL Editor and run.
```

### Seed sample data (optional, for demo)

In SQL Editor: paste and run `supabase/seed.sql`.

### Create the first owner admin user

In **Authentication → Users → Add user**, invite yourself by email and set a password. Then in SQL Editor:

```sql
insert into admin_profiles (id, role, full_name)
values ('<the user id from auth.users>', 'owner', 'Your Name');
```

---

## 3. Deploy to Vercel

1. Push this repo to GitHub.
2. https://vercel.com/new → import the repo.
3. **Framework preset**: Next.js (auto-detected).
4. Add environment variables (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://your-domain.com
INSTAGRAM_ACCESS_TOKEN=          # optional
INSTAGRAM_USER_ID=               # optional
RESEND_API_KEY=                  # optional
```

5. Deploy. First deploy takes ~2–3 minutes.

---

## 4. Custom domain

1. Vercel → Project → Settings → Domains.
2. Add your domain. Follow Vercel's DNS instructions (CNAME or A records).
3. Update `NEXT_PUBLIC_SITE_URL` env var to match the production URL and redeploy.

---

## 5. Instagram sync (optional)

Required only if you want the live IG widget + post import in the admin portal.

1. Go to https://developers.facebook.com → create a Meta app.
2. Add **Instagram Basic Display** product.
3. Generate a long-lived user access token for the @mdwatches.co account.
4. Set `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_USER_ID` in Vercel env vars.
5. Tokens expire every 60 days — refresh via the Graph API (or set a Vercel Cron to do it).

---

## 6. Post-deployment checklist

- [ ] Visit `/` — homepage loads cleanly.
- [ ] Visit `/shop` — products render (or empty state if no products yet).
- [ ] Place a test order — order confirmation page shows bank details.
- [ ] Sign in at `/admin/login` with the owner account.
- [ ] Upload a product with an image — confirm it appears on the public site.
- [ ] Walk an order through every status; confirm the customer's `/order/[id]` page reflects the change.
- [ ] Edit a value in `/admin/settings` — confirm it updates on the homepage after one reload.
- [ ] Run `curl https://your-domain.com/sitemap.xml` — confirm valid XML.
- [ ] Run `curl https://your-domain.com/robots.txt` — confirm `/admin` is disallowed.
- [ ] Lighthouse audit on mobile homepage — Performance ≥ 90, SEO ≥ 95.
- [ ] OG card check via https://opengraph.xyz/url/https%3A%2F%2Fyour-domain.com.
