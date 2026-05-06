# Owner's Guide — MD Watches Admin Portal

Welcome. This is the day-to-day handbook for running the MD Watches website without touching any code. Everything below happens at **`/admin`** on your live site.

---

## Signing in

1. Go to `https://your-domain.com/admin/login`.
2. Enter the email + password the developer set up for you.
3. You'll land on the **Dashboard**.

If you forget your password, use the Supabase dashboard → Authentication → send a password reset email.

---

## The dashboard at a glance

The dashboard shows:

- **Active / Sold / Today / Pending** counters — the pulse of the shop.
- **Confirmed revenue** — money from orders you've marked as paid.
- **Recent orders** and **Recent offers** — shortcuts to act on.
- Quick action buttons: **Add product** and **Manage orders**.

---

## Adding a watch

1. Click **+ Add product** (top-right of dashboard, or from `/admin/products`).
2. Fill in **Basic info**: name, brand, model, reference number, description.
3. Fill in **Specifications**: category, case size, movement, year, box/papers.
4. **Save** — you'll be redirected to the edit screen.
5. **Upload images** by clicking **Add image** in the Images section. The first image becomes primary by default; click the ★ to change which is primary.
6. In the right sidebar set:
   - **Status** → `active` to publish, `draft` to hide, `sold` for archive, `reserved` for held pieces.
   - **Stock quantity** → for one-of-a-kind pieces, set 1. For multi-unit listings, set the count.
   - **Pricing** → list price; optional "offer price" for discounted listings.
   - **Condition grade** → Mint / Excellent / Very Good / Good / Fair.
   - **Collection** → pick from the list (manage collections at `/admin/collections`).
   - **Featured on homepage** → toggle to show in the Featured carousel.
7. Click **Save changes**.

The watch goes live the moment you save with status = `active`.

---

## Managing orders

`/admin/orders` shows a five-column board: **Pending → Payment submitted → Confirmed → Shipped → Delivered**.

Click any order to open its detail view. From there you can:

- See the customer's contact info and delivery address.
- View their **payment proof upload** (if they uploaded one — opens for 10 minutes via signed URL).
- Update the **Status** dropdown.
- Set a **Tracking number**.
- Add **Internal notes** (visible only to admins).
- One-click **WhatsApp** and **Email** buttons to message the customer.

**Important:** When you set status to `payment_confirmed`, the system automatically decrements stock and marks the product `sold` if stock reaches zero.

### Order workflow (typical)

1. Order arrives → **Pending**. Customer sees bank transfer instructions.
2. Customer transfers and uploads proof → status auto-flips to **Payment submitted**.
3. You verify the deposit → set to **Payment confirmed**.
4. You ship → set tracking number, change to **Shipped**.
5. Customer receives → set to **Delivered**.

---

## Handling offers

`/admin/offers` lists every "Make an offer" submission. For each pending offer:

- **Accept** — marks accepted; you should follow up via WhatsApp/email to convert it.
- **Counter** — opens a dialog where you type your counter; saved and visible in the offer detail.
- **Reject** — politely decline.

---

## Editing site content (CMS)

`/admin/settings` is where you edit copy and configuration without touching code.

Tabs:

| Tab | What it controls |
| --- | --- |
| Homepage | Hero headline, subtext, CTA, hero image. |
| About | The full About page body. |
| Contact | WhatsApp number, email, Instagram URL. |
| **Bank** | **Account name, number, bank name, SWIFT, instructions.** Edit this on day one. |
| SEO | Default site title, meta description, OG image. |
| Announcement | The bar at the very top of the site (e.g. "Free shipping…"). Toggle on/off. |
| Footer | Footer tagline. |
| Conditions | Customer-facing copy for what each grade means. |

Changes show on the live site after one reload.

---

## Promo codes

`/admin/promo-codes` → **+ New code**.

- **Code**: case-insensitive, e.g. `SUMMER10`.
- **Type**: percentage off or fixed dollar amount.
- **Min order value**: optional minimum cart value.
- **Max uses**: cap before it deactivates.
- **Expires**: optional date.

Active codes are validated server-side at checkout (configured in the order flow).

---

## Collections

`/admin/collections` — create themed groupings (Luxury, Vintage, Funky, etc.). Toggle `Active` to show/hide on the public site. Assign products to a collection from the product edit screen.

---

## Instagram sync

`/admin/instagram` — if Instagram API is configured:

1. Click **Sync Instagram** to fetch your latest posts.
2. Click **Import as draft** on any post → creates a `draft` product with the caption as the description and the image already attached.
3. Edit the draft to fill in price, brand, etc., then publish.

If Instagram is not configured, the page shows a warning. Ask your developer to add `INSTAGRAM_ACCESS_TOKEN` to the env.

---

## Waitlist

`/admin/waitlist` shows everyone who signed up for notifications, either for a specific sold-out watch or the general newsletter. Each row has a **WhatsApp** quick-link.

---

## Inviting another admin

(Owner role only — you'll see this menu item if you're an owner.)

`/admin/users` → fill in name, email, role (Staff or Owner), click **Send invite**. They receive a magic-link from Supabase Auth. Once they accept, they appear in the table and can sign in.

**Staff** can do everything except invite/remove other admins.

---

## Things that aren't in the admin (yet)

- Refunds — handled manually via your bank, then mark the order `cancelled` here.
- Bulk product CSV import — present in code but not exposed in the UI yet.
- Customer accounts — not implemented; orders are looked up by their order number.

---

## When things go wrong

- **A product won't save**: check that price is filled in, condition grade is selected, and slug is unique.
- **An image won't upload**: check it's under 10MB and a real image (JPG/PNG/WebP).
- **Customer says they can't see their order**: orders are accessible at `/order/<order-id>`. The `id` is the UUID, not the order number. Send them the link from the admin order detail.
- **Site shows "TODO: owner input" anywhere**: that's a placeholder. Edit it under `/admin/settings`.

For anything else, contact your developer with screenshots.
