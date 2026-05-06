# MD Watches

Storefront and admin portal for **MD Watches** — a pre-loved watch reseller. Bank-transfer-only payment, mobile-first design, and a non-technical Admin Portal so the owner can manage everything without a developer.

## Quick start

```bash
npm install
cp .env.example .env.local
# fill in Supabase URL + keys (see docs/DEPLOYMENT.md)
npm run dev
```

Visit http://localhost:3000.

## Tech

Next.js 14 · TypeScript · Tailwind · Shadcn/UI · Supabase (Postgres + Auth + Storage) · zod · react-hook-form · Vitest · Playwright.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run lint` | Next.js lint |

## Documentation

- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Supabase + Vercel setup, post-deploy checklist.
- [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) — non-technical owner's guide to the admin portal.
- [docs/DEVELOPER.md](docs/DEVELOPER.md) — architecture, database schema, API reference.
- [docs/postman_collection.json](docs/postman_collection.json) — API collection.

## Project structure (high level)

```
app/(site)/      Public storefront pages
app/(admin)/     Admin portal (auth-gated)
app/api/         REST API (public + admin)
components/      UI + product + admin + forms + layout + icons
lib/             Supabase clients, zod schemas, utilities, auth helpers
supabase/        Migrations + seed data + storage policies
types/           TypeScript types
tests/           Vitest unit tests + Playwright E2E
docs/            Deployment, admin, developer documentation
```

## Inputs needed before going live

The codebase ships with `TODO: owner input` placeholders for:

- Logo files (`public/images/`)
- Bank account details (edit in `/admin/settings` → Bank tab)
- Contact details: WhatsApp number, email
- Sample/real products
- Custom domain

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full pre-launch checklist.
