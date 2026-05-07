# MD Watches — Project Context

A complete handover document for the MD Watches e-commerce site. Read this first
if you're picking up the project cold.

> **Companion docs**
> - `docs/ADMIN_GUIDE.md` — owner's playbook for running the shop day-to-day
> - `docs/DEPLOYMENT.md` — original deploy reference
> - `docs/DEVELOPER.md` — code-level architecture overview

---

## 1. What this is

A pre-loved watches e-commerce site with a public storefront and a full admin
portal. Customers browse, place enquiries / offers / orders. Owners run
everything from `/admin/*` without ever touching code.

Live at **https://md-watches.vercel.app**. Code lives at
**https://github.com/bilalahmed7393/mdwatches**.

---

## 2. Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Runtime | Node 25, React 18, TypeScript 5 |
| Styling | Tailwind 3 + shadcn-style components on Radix |
| DB / Auth / Storage | Supabase (Postgres + Auth + Storage) |
| Hosting | Vercel (Hobby plan) |
| Email (planned) | Resend (env var slot exists, not yet wired) |
| Image lib | sharp (transitive via Next), used in build scripts |
| Testing | Vitest (unit), Playwright (e2e — config only, no committed tests) |
| Lint | ESLint 9 flat config |
| ORM | None — direct Supabase client (typed via `types/database.ts`) |

Key dependencies:
- `@supabase/ssr` 0.10 + `@supabase/supabase-js` 2 for typed DB access
- `react-hook-form` + `zod` + `@hookform/resolvers` for forms
- `@radix-ui/react-*` for primitives (dialog, dropdown, navigation-menu, etc.)
- `lucide-react` v1 for icons (note: v1 dropped brand icons — Instagram /
  WhatsApp icons are hand-rolled in `components/icons/`)
- `nanoid` for upload paths (replaces `Date.now()` to satisfy
  `react-hooks/purity` lint rule)

---

## 3. Hosting & infrastructure

### 3.1 Supabase (production)

- **Project**: `wfxyezmvlitgyvewaxnh` in **AWS ap-south-1** (Mumbai).
- **Project URL**: `https://wfxyezmvlitgyvewaxnh.supabase.co`
- **Connection pooler URL**:
  `postgresql://postgres.wfxyezmvlitgyvewaxnh:<DB_PASSWORD>@aws-1-ap-south-1.pooler.supabase.com:6543/postgres`
- **Anon key**: stored in Vercel env (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) —
  also safe to ship to the browser
- **Service role key**: stored in Vercel env (`SUPABASE_SERVICE_ROLE_KEY`)
  — **never** ship to the browser; bypasses RLS
- **DB password**: known by the owner; needed for `supabase db push`
- **Auth**: password sign-in only; no OAuth/magic-link yet.
  Site URL + Redirect URLs in Auth settings should both point to the live
  Vercel URL (`https://md-watches.vercel.app`).
- **Storage buckets** (created during deploy):
  - `product-images` (public)
  - `site-assets` (public — used for hero images, collection covers, settings
    images)
  - `product-certificates` (private — admin signed URLs only)
  - `payment-proofs` (private — anonymous insert allowed for the order page;
    reads are admin-only via signed URLs)

### 3.2 Vercel

- **GitHub method**: every push to `main` auto-deploys
- **Hobby tier limits**: only daily crons. Currently no crons (Instagram sync
  was removed); `vercel.json` is just `{ framework: "nextjs" }`.
- **Required env vars** (all set to Production + Preview):
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SITE_URL          # heads-up: was set to mdwatches (no hyphen)
                                # but live URL is md-watches (with hyphen) —
                                # update this if you haven't already
  ```
- Optional env vars (not currently in Vercel):
  ```
  RESEND_API_KEY                # for outbound email (not wired yet)
  RESEND_FROM_EMAIL
  ```

### 3.3 Local Supabase stack

For development, a full Supabase stack runs in Docker on the developer's
machine. See section 4 below.

---

## 4. Local development

```bash
# One-time setup
brew install --cask docker-desktop      # required for Supabase local stack
brew install supabase/tap/supabase
supabase start                          # boots Postgres + Auth + Storage + Studio

# Project setup
npm install
cp .env.example .env.local              # then fill in local-supabase values
                                        # — `supabase status -o env` prints them
npm run seed:admin                      # creates the local admin user

npm run dev                             # http://localhost:3000
```

**Daily commands**:

| Command | What it does |
| --- | --- |
| `supabase start` / `supabase stop` | Boot/stop the local Supabase stack |
| `supabase db reset` | Wipe local DB and reapply migrations + seed |
| `supabase db push --db-url ...` | Apply migrations to a remote DB |
| `npm run dev` | Next dev server |
| `npm run build` | Production build (catches issues before deploy) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `eslint .` (flat config in `eslint.config.mjs`) |
| `npm test` | Vitest unit tests |
| `npm run seed:admin` | Create or update admin user from SEED_ADMIN_* env vars |

**Local URLs while `supabase start` is running**:
- API: http://127.0.0.1:54321
- Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio (DB UI): http://127.0.0.1:54323
- Mailpit (catches all emails): http://127.0.0.1:54324

**Pushing migrations to prod**: use the pooler URL because the direct DB host
(`db.<ref>.supabase.co`) is IPv6-only and many ISPs in this region don't have
IPv6 routing. The user's local network falls into this category.

```bash
URL="postgresql://postgres.wfxyezmvlitgyvewaxnh:<DB_PASSWORD>@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
supabase db push --db-url "$URL"
```

Storage policies (`supabase/storage.sql`) are applied via a one-shot psql:

```bash
docker run --rm -i postgres:16-alpine psql "$URL" < supabase/storage.sql
```

(The user doesn't have psql installed locally; the dockerised postgres image is
the workaround.)

---

## 5. Database schema (high-level)

Source of truth: `supabase/migrations/0001_init.sql` + 0002 (RLS) + 0003 (contact_messages).

```
collections ◄── products
products ◄── product_images
products ◄── product_certificates
products ◄── orders          (RESTRICT delete)
products ◄── offers          (CASCADE)
products ◄── waitlist        (CASCADE; null product_id = newsletter)
products ◄── analytics_events (SET NULL on delete)
products ◄── instagram_posts  (table still exists but unused — see §10)

auth.users ◄── admin_profiles (CASCADE)
contact_messages              (standalone; public insert, admin all)
```

**Key Postgres functions** (used by RLS):
- `is_admin()` — true if `auth.uid()` exists in `admin_profiles`
- `is_owner()` — true if `auth.uid()` exists in `admin_profiles` with `role='owner'`
- `increment_product_views(p_slug text)` — fire-and-forget RPC from product page
- `set_updated_at()` — generic trigger for `updated_at` columns

**View**: `admin_dashboard_stats` — single-query KPI roll-up used by
`/admin/dashboard`.

**RLS posture**:
- `products`, `product_images`, `collections`, `instagram_posts`,
  `site_settings`: public read, admin write
- `orders`, `offers`, `waitlist`, `analytics_events`, `contact_messages`:
  public insert only (so anonymous customers can submit), admin read/update
- `admin_profiles`: admin can read own row; only owners can write
- `promo_codes`: admin only
- Storage: public-read on `product-images` and `site-assets`; admin-only on
  `product-certificates`; admin + anonymous-insert on `payment-proofs`

---

## 6. Project layout

```
app/
├─ (site)/                  # Public storefront — wrapped with Header, Footer,
│   │                         FloatingWhatsApp, AnnouncementBar, CurrencyProvider
│   ├─ page.tsx             # Home (hero with gradient mesh, marquee, featured,
│   │                         new arrivals, browse-by-collection, brand story,
│   │                         newsletter)
│   ├─ shop/                # Shop list + filters
│   ├─ shop/[slug]/         # Product detail
│   ├─ collections/         # Collection landing
│   ├─ about/, contact/     # Static-ish pages
│   └─ order/[id]/          # Customer order tracker (bank-transfer flow,
│                             payment proof upload)
├─ (admin)/admin/           # Protected admin portal (requireAdmin)
│   ├─ dashboard/, products/, products/[id]/, products/new/
│   ├─ orders/, orders/[id]/
│   ├─ offers/, collections/, promo-codes/
│   ├─ messages/            # NEW — contact-form submissions (§7.4)
│   ├─ analytics/, waitlist/
│   ├─ settings/            # Site-wide CMS (hero copy, currency, bank, SEO,
│   │                         conditions, announcement, contact)
│   ├─ users/               # Owner-only — add/edit/remove other admins
│   └─ account/             # NEW — any admin updates own name/email/password
├─ (adminAuth)/admin/login/ # Public sign-in form
└─ api/                     # Public + admin APIs (see §6.1)

components/
├─ ui/                      # shadcn primitives (button, dialog, navigation-menu, etc.)
├─ layout/                  # Header, HeaderNav (mega-menu), Footer, MobileNav,
│                             AnnouncementBar, FloatingWhatsApp
├─ product/                 # ProductCard, ProductGallery, ProductActions, etc.
├─ forms/                   # BuyNowForm, MakeOfferForm, ContactForm, etc.
├─ admin/                   # All admin client components
└─ icons/                   # InstagramIcon, WhatsAppIcon (hand-rolled SVGs)

lib/
├─ supabase/                # client.ts (browser), server.ts (RSC, async cookies),
│                             admin.ts (service-role server-only),
│                             middleware.ts (session refresh), queries.ts (typed)
├─ schemas/                 # Zod schemas for product, order, offer, etc.
├─ utils/                   # cn, format (price/date/whatsapp link/order#),
│                             format-server (cached currency reader)
├─ api/                     # adminHandler — auth + zod wrapper for admin route handlers
├─ auth.ts                  # requireAdmin / requireOwner / getAdminContext
└─ currency.tsx             # CurrencyProvider + useCurrency / useFormatPrice hooks

scripts/
└─ seed-admin.mjs           # Bootstrap an admin user from SEED_ADMIN_* env vars

supabase/
├─ migrations/0001_init.sql
├─ migrations/0002_rls.sql
├─ migrations/0003_contact_messages.sql
├─ storage.sql              # Bucket-level RLS — applied separately
├─ seed.sql                 # Demo collections, settings, 5 demo products
└─ config.toml              # Local stack config

types/
└─ database.ts              # Hand-curated Supabase types (regenerate via
                              `npm run db:types`)

middleware.ts               # Supabase session refresh + /admin gate
```

### 6.1 API routes

```
app/api/
├─ contact/route.ts         # POST: insert into contact_messages
├─ collections/, products/, products/[slug]/    # Public reads
├─ offers/, orders/, waitlist/                  # Public inserts
├─ orders/[id]/payment-proof/                   # Customer uploads proof
├─ analytics/event/                             # Generic event ingest
└─ admin/
    ├─ account/                                 # PATCH own profile
    ├─ collections/, collections/[id]/
    ├─ messages/[id]/                           # PATCH status/notes, DELETE
    ├─ offers/[id]/, orders/[id]/
    ├─ products/, products/[id]/
    ├─ products/[id]/images/, .../[imageId]/
    ├─ promo-codes/, promo-codes/[id]/
    ├─ settings/, users/, users/[id]/
```

All admin routes are wrapped in `adminHandler({ schema, ownerOnly? })` from
`lib/api/admin-handler.ts`. That handler:
1. Validates the session via `getAdminContext()`
2. Optionally requires owner role
3. Validates request body against a Zod schema
4. Catches errors and returns consistent JSON shapes

---

## 7. Customer-facing features

### 7.1 Storefront UI
- **Logo**: `public/brand/md-watches-mark.png` (cropped from the original M+D
  monogram). Generated via the sharp script that detects the WATCHES band and
  crops above it. Favicon + apple-touch-icon variants in the same folder.
- **Header mega-menu**: Radix `NavigationMenu` with Shop (3 columns: brands +
  categories + highlights), Collections (curated edits), About, Contact. On
  open, the entire page content (`main`, `footer`) gets `filter: blur(8px)`
  via a `body[data-nav-open]` CSS rule — the header itself stays sharp.
- **Mobile drawer** (`MobileNav.tsx`): Sheet with the same nav rendered as
  collapsible cards. Each Shop sub-section is its own bordered card with an
  icon badge — brands and categories render as chip pills, highlights as a
  list with descriptions.
- **Hero**: animated CSS gradient mesh + film-grain noise overlay
  (`@layer components` in `globals.css`), pulsing accent dot, soft glow
  behind the hero image, pill-shaped CTAs with `-translate-y-0.5` hover.
- **Trust marquee**: black band right after the hero with a CSS keyframe
  marquee (38s linear loop), respects `prefers-reduced-motion`.
- **Floating WhatsApp button** (bottom-right of every customer page):
  reads `contact.whatsapp` from settings, opens `wa.me/<number>` with a
  pre-filled greeting. Shows a soft pulse ring (motion-reduce hidden), an
  online dot, and a slide-in tooltip on hover.

### 7.2 Shopping flow
- `/shop` with filters (brand, category, condition, collection, price range,
  search, sort) — all driven by URL params; `searchParams` is properly awaited
  per Next.js 16's async dynamic API.
- Product detail: gallery, condition badge, structured-data JSON-LD,
  ProductActions (Buy now / Make offer / Share / Add to waitlist), spec grid,
  condition guide accordion, related-by-brand grid.
- View counter via `increment_product_views` Postgres RPC (fire-and-forget
  from RSC).

### 7.3 Order flow
- BuyNowForm collects customer info → POST `/api/orders` → DB row created with
  status `pending`.
- Customer is redirected to `/order/[id]` which shows the bank-transfer
  instructions (from `bank.*` settings), a status timeline, and a payment-
  proof uploader (writes to the `payment-proofs` private bucket; signed URLs
  on the admin side).
- When admin sets status to `payment_confirmed`, a Postgres trigger
  decrements stock and marks the product `sold` if stock hits zero.

### 7.4 Contact form → admin Messages (NEW)
- ContactForm posts to `/api/contact`, which inserts into the new
  `contact_messages` table (also captures user-agent and forwarded IP).
- Admin sees them at `/admin/messages` with filter pills, two-pane list/detail
  layout, reply-by-email button (opens mailto with prefilled greeting), mark
  replied / mark unread, delete, internal notes, and a collapsible
  submission-details panel.
- Pre-existing submissions in `analytics_events` were backfilled into
  `contact_messages` during migration 0003.
- **Not yet wired**: email notification on new submission. The original
  TODO still stands; would be done with Resend.

---

## 8. Admin features

### 8.1 Auth
- Password sign-in at `/admin/login`. Backed by Supabase Auth. Cookie-based
  session via `@supabase/ssr` 0.10 (`getAll` / `setAll` API — NOT the
  legacy `get`/`set`/`remove` API).
- `requireAdmin()` (in `lib/auth.ts`) is called in `app/(admin)/admin/layout.tsx`
  — redirects unauthenticated users to `/admin/login` and refuses signed-in
  users without an `admin_profiles` row.
- `requireOwner()` is the same but checks `role='owner'`. Used on
  `/admin/users/page.tsx`.

### 8.2 Sidebar (and mobile drawer)
- Desktop: fixed left sidebar (`hidden md:flex`).
- Mobile: sticky top bar with hamburger → side drawer with backdrop blur.
- Both share the same nav code; closing the drawer is wired to link
  `onClick` (not a `useEffect` — the project's strict
  `react-hooks/set-state-in-effect` rule rejects state-syncing effects).
- Currently exposes: Dashboard, Products, Orders, Offers, Messages,
  Collections, Promo codes, Analytics, Waitlist, Settings, My account; plus
  Users for owners only.

### 8.3 Settings (`/admin/settings`)
- Tab per `section` in `site_settings`: General (currency), Homepage,
  About, Contact, Bank transfer, Announcement bar, Footer, SEO & sharing,
  Condition guide.
- Each setting has a friendly label + description (mapped in
  `FIELD_META` inside `SettingsForm.tsx`).
- Image-type settings get a real uploader (writes to `site-assets` bucket
  with a nanoid path) plus a paste-URL fallback.
- Boolean settings render as a toggle switch.
- Sticky save button at the bottom.

### 8.4 Currency (`currency.code` in settings)
- Default `USD`. Accepts any ISO 4217 code.
- Server reads via `getServerCurrency()` (cached per request via React's
  `cache()`, defined in `lib/utils/format-server.ts`).
- Client reads via `useFormatPrice()` hook from `lib/currency.tsx`, which
  consumes `CurrencyProvider`. Both site and admin layouts wrap their
  children in the provider.
- All `formatPrice(value, currency)` call sites have been updated; changing
  the setting flips prices everywhere.

### 8.5 Products
- ProductForm uses `react-hook-form` + zod. Three checkboxes (`is_featured`,
  `has_box`, `has_papers`) use `Controller` because Radix `Checkbox` fires
  `onCheckedChange`, not `onChange` — registering them with `register()` was
  the original bug that made "Featured on homepage" silently fail to persist.
- Image uploader writes to `product-images/products/<product-id>/<nanoid>.<ext>`.
- One-click "Set primary" toggles which image is the cover.

### 8.6 Collections
- Inline cover-image upload per row (hover thumbnail to reveal upload UI).
  Saves to `site-assets/collections/<id>/cover-<nanoid>.<ext>` and updates
  `cover_image_url`.

### 8.7 Users (owner only)
- Create new admin directly with name/email/password/role — no
  email-invite roundtrip. Done via `auth.admin.createUser({ email_confirm: true })`
  + `admin_profiles.insert`. If profile insert fails, the auth user is rolled
  back.
- Edit any admin: name / email / password / role via dialog (key-remount
  pattern, no `useEffect` state sync).
- Delete: removes both auth user and profile row in one shot. Self-deletion
  is prevented in the API.

### 8.8 My account (any admin)
- `/admin/account` — change own name, email, password.
- Backed by `/api/admin/account` PATCH which uses the user's session
  (`getAdminContext()`), not service-role privilege escalation.

---

## 9. Known things to watch for

### 9.1 Next.js 16 compatibility quirks
- `cookies()` is async — never call without `await`.
- `searchParams` and `params` on pages are `Promise<...>` — must be awaited.
- `next lint` was removed; the repo uses `eslint .` directly via the flat
  config in `eslint.config.mjs`.
- `dangerouslyAllowLocalIP: true` is set in `next.config.mjs` for development
  only — production keeps the SSRF protection on.

### 9.2 Lint rules to know
- `react-hooks/set-state-in-effect` — flags effect-based state syncing. Use
  `key` remounts or controlled props.
- `react-hooks/refs` — flags ref mutation during render.
- `react-hooks/purity` — flags `Date.now()` and other non-pure calls in
  components. We use `nanoid(10)` instead for upload paths.
- `@typescript-eslint/no-require-imports` — no CommonJS `require()`. The
  Tailwind plugin is imported with ESM syntax.

### 9.3 Image hosting
- `next.config.mjs` allows `images.unsplash.com` for seed photos plus the
  Supabase project hostname. Adding new image sources means adding to
  `remotePatterns`.
- Some seeded Unsplash URLs may 404 over time as Unsplash removes photos.
  Replace via the admin product editor.
- One known case: the previous Seiko seed URL was already swapped in the
  seed file and on prod (`photo-1606293459379-fb9b4ff45f55` →
  `photo-1611591437281-460bfbe1220a`).

### 9.4 Storage & sensitive files
- `.env.local` is gitignored.
- The DB password and Supabase service-role key are NOT in the repo. They
  live only in Vercel env vars and the developer's `.env.local`.
- The repo is currently public on GitHub. If you make it private again, also
  update Vercel's GitHub App access (Path 1 in deploy notes — grant access
  to the private repo).

### 9.5 Deprecation warnings
- `next build` warns: *"The 'middleware' file convention is deprecated.
  Please use 'proxy' instead."* — non-breaking but worth migrating when you
  have time.

---

## 10. Removed features (don't reintroduce by accident)

- **Instagram sync**. There used to be a feature that auto-imported posts
  from the Instagram Basic Display API. It's been deleted entirely:
  - `app/(admin)/admin/instagram/`, `app/api/admin/instagram/`,
    `app/api/instagram/feed/`, `components/admin/ImportButton.tsx`,
    `components/admin/InstagramSyncBar.tsx` are all gone
  - The Instagram sidebar entry is gone
  - The Vercel cron is gone
  - `INSTAGRAM_*` env vars are gone from `.env.example`
  - The `instagram_posts` table is **still in the DB** (no harm, no
    migration to drop it). If you want to fully remove it, write an 0004
    migration. The hand-curated `InstagramPost` interface in
    `types/database.ts` can also stay or go.
- **Instagram social link** in the footer/contact pages is unrelated and
  stays — it's just an `<a href>` to the brand's Instagram profile.

---

## 11. Outstanding TODOs / suggested next work

| Priority | Item |
| --- | --- |
| Med | `NEXT_PUBLIC_SITE_URL` is wrong in Vercel — set to `https://md-watches.vercel.app` (with hyphen) and redeploy. Affects sitemap canonical URLs and OG image base. |
| Med | Change the default admin password (`admin12345`) — log in to `/admin/account` and set a real one. |
| Med | Set the real `contact.whatsapp` number in `/admin/settings` → Contact (currently the seed placeholder `+10000000000`). The floating button works either way. |
| Med | Email notification on new contact-form submission (Resend integration). |
| Low | Drop the `instagram_posts` table via a 0004 migration if you want a clean schema. |
| Low | Migrate `middleware.ts` → `proxy.ts` to silence the deprecation warning. |
| Low | Set git config user.name / user.email to a real identity (commits currently land as `BILAL AHMED <bilal@USMs-MacBook-Air-18.local>`). |
| Low | Drag-to-reorder for collections and product images. |
| Low | Browser-side image cropper before storage upload (so non-square hero / cover images don't get stretched). |

---

## 12. Session timeline (most recent first)

1. **Admin Messages page** (`/admin/messages`) — replaced the analytics-events
   contact-form dump with a proper `contact_messages` table and a full UI.
   Migration 0003 + backfill from old data.
2. **Floating WhatsApp button** — bottom-right of every customer page; reads
   `contact.whatsapp` from settings.
3. **Mobile site nav redesign** — distinct cards per Shop sub-section
   (brands, categories, highlights) with icons and chip-style items.
4. **Mobile admin drawer** — sticky top bar + side drawer because the
   sidebar was previously `hidden md:flex` with no mobile fallback.
5. **Currency setting + provider** — `currency.code` site_setting,
   `getServerCurrency()` (cached) for server, `useFormatPrice()` hook for
   client. Updated all `formatPrice(...)` call sites.
6. **Admin user management** — owner can add/edit/delete admins;
   `/admin/account` for self-service email/password updates.
7. **Instagram sync — fully removed** (see §10).
8. **Mobile polish** — hero padding/text size, hero image aspect, section
   paddings, admin tables get horizontal scroll instead of squishing.
9. **Vercel deploy** — GitHub-based, hosted Supabase in ap-south-1, all envs
   wired, smoke-tested with Playwright. Seiko seed URL fixed.
10. **Local Supabase setup** — Docker Desktop + Supabase CLI, full local
    stack, migrations + storage policies + admin seed.
11. **Stronger dropdown blur** — page content now uses CSS `filter: blur()`
    via `body[data-nav-open]` (more reliable than `backdrop-filter`).
12. **Hero polish** — animated gradient mesh, film grain, marquee strip,
    glow behind hero image, pill CTAs.
13. **Mega-menu nav** — Radix NavigationMenu with backdrop blur, replacing
    the original flat link bar.
14. **Logo wiring** — MD Watches mark across header, mobile drawer, favicon,
    metadata icons.
15. **Settings form redesign** — friendly labels + descriptions, image
    uploader, toggle switches.
16. **Featured-on-homepage bug fix** — Radix Checkbox needs `Controller`,
    not `register()`.
17. **Collection cover-image upload** in admin Collections.
18. **Next.js 16 compatibility** — async `cookies()` / `searchParams` /
    `params`; ESLint 9 flat config; tailwind plugin ESM import.
