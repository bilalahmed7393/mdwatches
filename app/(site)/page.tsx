import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import {
  getCollections,
  getFeaturedProducts,
  getNewArrivals,
  getSiteSettings,
} from "@/lib/supabase/queries";

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
      <section className="relative isolate overflow-hidden">
        <div className="container-wide grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <h1 className="font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
              {headline}
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">{subtext}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="accent">
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/about">Our story</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
            {heroImage ? (
              <Image src={heroImage} alt="" fill priority className="object-cover" />
            ) : featured[0]?.images[0]?.image_url ? (
              <Image
                src={featured[0].images[0].image_url}
                alt={featured[0].name}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Hero image
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container-wide py-12">
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
        <section className="container-wide py-12">
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
        <section className="container-wide py-12">
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
      <section className="container-wide my-16 grid items-center gap-10 rounded-lg border bg-secondary/30 p-8 md:grid-cols-2 md:p-12">
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
