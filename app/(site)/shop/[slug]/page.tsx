import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ConditionBadge } from "@/components/product/ConditionBadge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductCard } from "@/components/product/ProductCard";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils/format";
import {
  getProductBySlug,
  getRelatedProducts,
  getSiteSettings,
} from "@/lib/supabase/queries";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Watch not found" };
    return {
      title: `${product.brand} ${product.name}`,
      description: product.meta_description ?? product.description ?? undefined,
      openGraph: {
        title: `${product.brand} ${product.name}`,
        description: product.meta_description ?? product.description ?? undefined,
        images: product.images[0]?.image_url ? [product.images[0].image_url] : [],
      },
    };
  } catch {
    return { title: "Watch" };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  let product;
  let related: Awaited<ReturnType<typeof getRelatedProducts>> = [];
  let conditions: Record<string, string> = {};
  try {
    product = await getProductBySlug(slug);
    if (!product) notFound();
    related = await getRelatedProducts(product.id, product.brand, 4);
    conditions = await getSiteSettings();
    // Fire-and-forget view increment.
    const supabase = createAdminClient();
    void supabase.rpc("increment_product_views", { p_slug: slug });
  } catch {
    notFound();
  }

  if (!product) notFound();

  const isSold = product.status === "sold";
  const finalPrice = product.offer_price && product.offer_price < product.price
    ? product.offer_price
    : product.price;

  // Structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.name}`,
    image: product.images.map((i) => i.image_url),
    description: product.description ?? "",
    sku: product.reference_number ?? product.id,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      price: finalPrice,
      priceCurrency: "USD",
      availability: isSold
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <article className="container-wide grid gap-10 py-10 md:grid-cols-2 md:gap-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductGallery images={product.images} sold={isSold} />

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {product.brand}
            </span>
            <ConditionBadge grade={product.condition_grade} />
          </div>
          <h1 className="font-display text-3xl tracking-tight md:text-4xl">{product.name}</h1>
          {product.reference_number && (
            <p className="text-sm text-muted-foreground">Ref. {product.reference_number}</p>
          )}
        </div>

        <div className="flex items-baseline gap-3">
          {product.offer_price && product.offer_price < product.price ? (
            <>
              <span className="font-display text-3xl">{formatPrice(product.offer_price)}</span>
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="font-display text-3xl">{formatPrice(product.price)}</span>
          )}
          {isSold && <Badge variant="sold">Sold</Badge>}
        </div>

        <ProductActions
          productId={product.id}
          productName={`${product.brand} ${product.name}`}
          available={!isSold && product.stock_quantity > 0}
          basePrice={finalPrice}
        />

        {product.description && (
          <div className="prose prose-sm max-w-none whitespace-pre-line text-foreground/90">
            {product.description}
          </div>
        )}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border p-5 text-sm">
          <Spec label="Brand" value={product.brand} />
          {product.model && <Spec label="Model" value={product.model} />}
          {product.reference_number && <Spec label="Reference" value={product.reference_number} />}
          {product.case_size_mm && (
            <Spec label="Case size" value={`${product.case_size_mm} mm`} />
          )}
          {product.movement_type && <Spec label="Movement" value={product.movement_type} />}
          {product.year && <Spec label="Year" value={String(product.year)} />}
          <Spec label="Box" value={product.has_box ? "Yes" : "No"} />
          <Spec label="Papers" value={product.has_papers ? "Yes" : "No"} />
          <Spec label="Condition" value={product.condition_grade} />
        </dl>

        <details className="rounded-md border p-4 text-sm">
          <summary className="cursor-pointer font-medium">Condition grading explained</summary>
          <ul className="mt-3 space-y-1 text-muted-foreground">
            <li><b>Mint</b> — {conditions["condition.mint"]}</li>
            <li><b>Excellent</b> — {conditions["condition.excellent"]}</li>
            <li><b>Very Good</b> — {conditions["condition.very_good"]}</li>
            <li><b>Good</b> — {conditions["condition.good"]}</li>
            <li><b>Fair</b> — {conditions["condition.fair"]}</li>
          </ul>
        </details>
      </div>

      {related.length > 0 && (
        <section className="md:col-span-2">
          <h2 className="mb-6 font-display text-2xl tracking-tight">Other {product.brand} watches</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-6">
            <Link href="/shop" className="text-sm underline-offset-4 hover:underline">
              ← Back to shop
            </Link>
          </div>
        </section>
      )}
    </article>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
