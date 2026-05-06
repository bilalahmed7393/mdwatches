# Developer Documentation — MD Watches

Technical reference for engineers maintaining or extending this codebase.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + Shadcn/UI primitives |
| Database / Auth / Storage | Supabase (Postgres + RLS + Storage) |
| Validation | zod (schemas shared between client + API) |
| Forms | react-hook-form + `@hookform/resolvers/zod` |
| State | Zustand (where needed) |
| Tests | Vitest + Testing Library, Playwright (E2E) |
| Deployment | Vercel + Supabase |

---

## Architecture

```
Browser ─────────► Next.js (Vercel)
                    ├─ App Router pages (RSC + Client Components)
                    ├─ Route Handlers (`app/api/...`) — REST API
                    └─ Middleware — Supabase session refresh + /admin auth
                              │
                              ▼
                       Supabase (Postgres + Storage + Auth)
                       ├─ RLS policies guard all reads/writes
                       ├─ `is_admin()` Postgres function for auth gates
                       └─ Storage buckets: product-images (public), payment-proofs (private)
```

Server Components fetch directly from Supabase via `lib/supabase/server.ts` (SSR-safe, cookie-aware). Admin route handlers use `lib/supabase/admin.ts` (service-role, **server-only**, bypasses RLS by design).

---

## Local development

```bash
git clone <repo>
cd mdwatches
npm install
cp .env.example .env.local      # fill in Supabase keys
npm run dev                     # http://localhost:3000
```

Other scripts:

```bash
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright (requires `test:e2e:install` first)
npm run lint        # next lint
```

---

## Project structure

```
app/
├─ (site)/           # Public site routes (header/footer chrome)
│   ├─ shop/         # /shop and /shop/[slug]
│   ├─ collections/  # /collections
│   ├─ about/        # /about
│   ├─ contact/      # /contact
│   ├─ order/[id]/   # /order/<uuid>
│   ├─ layout.tsx    # Site chrome
│   └─ page.tsx      # Homepage
├─ (admin)/admin/    # Protected admin portal
│   ├─ dashboard/, products/, orders/, offers/, …
│   └─ layout.tsx    # Calls requireAdmin()
├─ (adminAuth)/admin/login/   # Public admin login
├─ api/              # Public API
│   ├─ orders/, offers/, waitlist/, contact/, products/, collections/, instagram/feed/
│   └─ admin/        # Admin-only API (gated via adminHandler)
├─ sitemap.ts
├─ robots.ts
├─ not-found.tsx
└─ error.tsx

components/
├─ ui/               # Shadcn primitives (button, dialog, input, …)
├─ layout/           # Header, Footer, MobileNav, AnnouncementBar
├─ product/          # ProductCard, ProductGallery, ProductActions, ConditionBadge, ShopFilters/Sort
├─ forms/            # BuyNowForm, MakeOfferForm, WaitlistForm, ContactForm, NewsletterForm, PaymentProofUpload
├─ admin/            # All admin-portal client components
└─ icons/            # InstagramIcon (lucide-react v1 dropped brand icons)

lib/
├─ supabase/         # client.ts (browser), server.ts (RSC), admin.ts (service-role), middleware.ts (session), queries.ts (typed reads)
├─ schemas/          # zod schemas (order, offer, waitlist, contact, product, promo, collection)
├─ utils/            # cn, format (price/date/slug/order#/whatsapp link)
├─ api/              # adminHandler — auth + zod wrapper for admin route handlers
└─ auth.ts           # requireAdmin / requireOwner / getAdminContext

supabase/
├─ migrations/0001_init.sql    # tables, enums, indexes, triggers, functions, view
├─ migrations/0002_rls.sql     # RLS policies for every table
├─ storage.sql                 # Storage bucket policies
└─ seed.sql                    # 5 demo products + collections + site_settings

types/database.ts              # Hand-curated Supabase types (regenerate via `npm run db:types`)

tests/
├─ unit/                        # Vitest + Testing Library
└─ e2e/                         # Playwright

middleware.ts                   # Supabase session refresh + /admin auth redirect
```

---

## Database schema (12 tables)

See `supabase/migrations/0001_init.sql` for the source of truth. Key relationships:

```
collections ◄─ products
products ◄── product_images
products ◄── product_certificates
products ◄── orders         (RESTRICT delete)
products ◄── offers         (CASCADE)
products ◄── waitlist       (CASCADE; null product_id = newsletter signup)
products ◄── analytics_events (SET NULL on delete)
products ◄── instagram_posts.linked_product_id (SET NULL)

auth.users ◄── admin_profiles (CASCADE)
```

Key Postgres functions:

- `increment_product_views(p_slug text)` — called from RSC in product detail page.
- `is_admin()` / `is_owner()` — used by RLS policies to gate admin tables.
- `set_updated_at()` — generic `updated_at` trigger function.

The view `admin_dashboard_stats` powers the dashboard KPIs in a single query.

---

## RLS strategy

- Public reads: `products` (active/sold/reserved), `product_images`/`certificates` (only for visible products), `collections` (active), `site_settings` (all), `instagram_posts` (all).
- Public writes: `orders`, `offers`, `waitlist`, `analytics_events` (insert-only).
- Admin: full access on all tables.
- Owner: full access plus `admin_profiles` writes (RLS-enforced).
- `promo_codes`: admin-only reads/writes (server validates codes via service-role).

The service-role client (`lib/supabase/admin.ts`) bypasses RLS entirely — only use it from route handlers and after verifying the admin context with `getAdminContext()` / `requireAdmin()`.

---

## API reference

### Public

| Method | Endpoint | Body / Query |
| --- | --- | --- |
| GET | `/api/products` | `?status=active&brand=Rolex&sort=newest&page=1&page_size=12&q=submariner` |
| GET | `/api/products/[slug]` | — |
| GET | `/api/collections` | — |
| POST | `/api/orders` | `OrderInput` (zod) |
| POST | `/api/orders/[id]/payment-proof` | `{ path: string }` |
| POST | `/api/offers` | `OfferInput` |
| POST | `/api/waitlist` | `WaitlistInput` |
| POST | `/api/contact` | `ContactInput` |
| POST | `/api/analytics/event` | `{ event_type, product_id?, session_id?, metadata? }` |
| GET | `/api/instagram/feed` | — |

All zod schemas live in `lib/schemas/`. They're shared between the client form and the server handler — change one place, both stay in sync.

### Admin (require Supabase auth cookie)

| Method | Endpoint |
| --- | --- |
| POST/PUT/DELETE | `/api/admin/products[/id]` |
| POST/PUT/DELETE | `/api/admin/products/[id]/images[/imageId]` |
| PATCH | `/api/admin/orders/[id]` |
| PATCH | `/api/admin/offers/[id]` |
| POST/PUT/DELETE | `/api/admin/collections[/id]` |
| POST/PUT/DELETE | `/api/admin/promo-codes[/id]` |
| PUT | `/api/admin/settings` (bulk upsert) |
| POST | `/api/admin/instagram/sync` |
| POST | `/api/admin/instagram/import` |
| POST/PATCH/DELETE | `/api/admin/users[/id]` (owner-only) |

All admin routes use `lib/api/admin-handler.ts` which wraps `getAdminContext()` + zod parsing + error handling. To add a new admin route:

```ts
import { adminHandler } from "@/lib/api/admin-handler";
import { mySchema } from "@/lib/schemas/...";

export const POST = adminHandler({ schema: mySchema }, async ({ body, supabase, params }) => {
  const { error } = await supabase.from("...").insert(body);
  if (error) throw error;
  return { ok: true };
});
```

---

## Storage paths

- `product-images/products/<product_id>/<timestamp>.<ext>` — public.
- `payment-proofs/<order_id>/<timestamp>.<ext>` — private; admin reads via signed URL.
- `product-certificates/<product_id>/<timestamp>.<ext>` — private.
- `site-assets/<key>/<file>` — public; used for hero images, OG images, etc.

---

## Adding a new feature

1. Add (or modify) a table in a new migration: `supabase/migrations/0003_<feature>.sql`.
2. Update `types/database.ts` accordingly.
3. Add a zod schema in `lib/schemas/`.
4. Add a query helper in `lib/supabase/queries.ts` if it's a read.
5. Add an API route under `app/api/` (public) or `app/api/admin/` (admin).
6. Build the UI in `components/` and the page in `app/(site)/...` or `app/(admin)/admin/...`.
7. Write a Vitest test for the schema and at least one component test.

---

## Known caveats

- **lucide-react v1** drops brand icons (Instagram, Twitter, etc.). Replace with inline SVGs in `components/icons/`.
- **`Database` type generic on supabase-js v2** infers Insert payloads as `never[]` for hand-written types in some cases — that's why `lib/supabase/admin.ts` is intentionally untyped. Reads use the typed client in `lib/supabase/queries.ts`.
- **Auto-prerender** is disabled (`export const dynamic = "force-dynamic"`) on routes that hit Supabase, since the build environment usually doesn't have keys.
- **Vitest over Jest** — chosen for speed + DX. Trivial swap if needed.
- **Owner first sign-in**: must be created manually in Supabase dashboard (auth.users) and seeded into `admin_profiles` with role='owner'. See `docs/DEPLOYMENT.md`.

---

## Performance targets

- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 95.
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms.
- Bundle size: shared JS ≈ 87 kB. Largest route is `/order/[id]` at ~173 kB First Load JS due to Supabase client.
