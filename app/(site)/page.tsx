import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import {
  getCollections,
  getFeaturedProducts,
  getNewArrivals,
  getSiteSettings,
} from "@/lib/supabase/queries";

const MARQUEE_ITEMS = [
  "Authenticated by hand",
  "Worldwide shipping",
  "Bank-transfer payments",
  "Insured & tracked delivery",
  "30-day return window",
];

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let newArrivals: Awaited<ReturnType<typeof getNewArrivals>> = [];
  let collections: Awaited<ReturnType<typeof getCollections>> = [];
  let settings: Record<string, string> = {};

  try {
    [featured, newArrivals, collections, settings] = await Promise.all([
      getFeaturedProducts(6),
      getNewArrivals(8),
      getCollections(),
      getSiteSettings(),
    ]);
  } catch {
    // Supabase not configured yet — render empty state.
  }

  const headline = settings["hero.headline"] ?? "Stories on the wrist.";
  const subtext =
    settings["hero.subtext"] ??
    "Hand-picked pre-loved watches. Authenticated. Ready to ship.";
  const ctaLabel = settings["hero.cta_label"] ?? "Shop the collection";
  const ctaHref = settings["hero.cta_href"] ?? "/shop";
  const heroImage = settings["hero.image_url"];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden grain">
        {/* Animated gradient mesh */}
        <div aria-hidden className="mesh-bg absolute inset-0 -z-10" />
        {/* Soft horizontal lines for subtle texture */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, transparent 0, transparent calc(100% - 1px), hsl(var(--foreground)) 100%)",
            backgroundSize: "100% 5rem",
          }}
        />

        <div className="container-wide grid items-center gap-8 py-12 md:grid-cols-2 md:gap-10 md:py-28">
          <div className="space-y-5 md:space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              New arrivals every week
            </span>

            <h1 className="font-display text-[2.75rem] leading-[1.02] tracking-tight md:text-7xl">
              {headline}
            </h1>
            <p className="max-w-md text-base text-muted-foreground md:text-lg">{subtext}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="accent" className="rounded-full px-7 shadow-lg shadow-accent/20 transition-transform hover:-translate-y-0.5">
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7 border-foreground/15 hover:bg-foreground/[0.04] transition-transform hover:-translate-y-0.5">
                <Link href="/about">Our story</Link>
              </Button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Authenticated
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5" /> Worldwide shipping
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Hand-inspected
              </span>
            </div>
          </div>

          <div className="relative">
            {/* Soft glow behind the image */}
            <div
              aria-hidden
              className="absolute -inset-8 -z-10 rounded-[3rem] bg-accent/15 blur-3xl"
            />
            <div className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-2xl ring-1 ring-foreground/5">
              {heroImage ? (
                <Image src={heroImage} alt="" fill priority className="object-cover transition-transform duration-700 hover:scale-105" />
              ) : featured[0]?.images[0]?.image_url ? (
                <Image
                  src={featured[0].images[0].image_url}
                  alt={featured[0].name}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Hero image
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee trust strip */}
      <section
        aria-hidden
        className="relative -mt-2 overflow-hidden border-y bg-foreground py-4 text-background"
      >
        <div className="marquee text-[0.7rem] font-medium uppercase tracking-[0.32em]">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-12">
              <span className="text-background/85">{item}</span>
              <span aria-hidden className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container-wide py-10 md:py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">Featured</h2>
            <Link href="/shop" className="text-sm underline-offset-4 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 3} />
            ))}
          </div>
        </section>
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="container-wide py-10 md:py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">
              New arrivals
            </h2>
            <Link href="/shop?sort=newest" className="text-sm underline-offset-4 hover:underline">
              See more
            </Link>
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0">
            {newArrivals.map((p) => (
              <div key={p.id} className="w-64 shrink-0 snap-start md:w-auto">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <section className="container-wide py-10 md:py-12">
          <h2 className="mb-6 font-display text-3xl tracking-tight md:text-4xl">
            Browse by collection
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/shop?collection=${c.slug}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-md bg-secondary"
              >
                {c.cover_image_url ? (
                  <Image
                    src={c.cover_image_url}
                    alt={c.name}
                    fill
                    sizes="(max-width:768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-background">
                  <h3 className="font-display text-2xl">{c.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Brand story */}
      <section className="container-wide my-10 grid items-center gap-8 rounded-lg border bg-secondary/30 p-6 md:my-16 md:gap-10 md:grid-cols-2 md:p-12">
        <div>
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            Pre-loved, properly.
          </h2>
          <p className="mt-4 text-muted-foreground">
            {settings["about.body"] ??
              "Every watch is hand-inspected, photographed in detail, and authenticated before it lands in the shop. Bank transfer payment, worldwide shipping, no surprises."}
          </p>
          <Link
            href="/about"
            className="mt-6 inline-flex items-center text-sm underline-offset-4 hover:underline"
          >
            Read more <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
        <div className="rounded-md border bg-background p-6">
          <h3 className="font-display text-xl">Join the list</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get an early look at new arrivals.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
