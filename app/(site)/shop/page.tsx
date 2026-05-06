import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopFilters } from "@/components/product/ShopFilters";
import { ShopSort } from "@/components/product/ShopSort";
import {
  getActiveProducts,
  getCollections,
  getDistinctBrands,
} from "@/lib/supabase/queries";
import { conditionGrades } from "@/lib/schemas/product";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop",
  description: "Browse the full collection of pre-loved watches.",
};

type SearchParams = Record<string, string | string[] | undefined>;

interface ShopPageProps {
  searchParams: Promise<SearchParams>;
}

function param(searchParams: SearchParams, key: string): string | undefined {
  const v = searchParams[key];
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const sp = await searchParams;
  const page = Number(param(sp, "page") ?? 1);
  const pageSize = 12;

  let products: Awaited<ReturnType<typeof getActiveProducts>> = { products: [], total: 0 };
  let collections: Awaited<ReturnType<typeof getCollections>> = [];
  let brands: string[] = [];

  try {
    [products, collections, brands] = await Promise.all([
      getActiveProducts({
        brand: param(sp,"brand"),
        category: param(sp,"category"),
        collectionSlug: param(sp,"collection"),
        conditionGrade: param(sp,"condition"),
        minPrice: param(sp,"min_price")
          ? Number(param(sp,"min_price"))
          : undefined,
        maxPrice: param(sp,"max_price")
          ? Number(param(sp,"max_price"))
          : undefined,
        status: (param(sp,"status") as "active" | "sold" | "all" | undefined) ?? undefined,
        search: param(sp,"q"),
        sort: (param(sp,"sort") as "newest" | "price_asc" | "price_desc" | "most_viewed" | undefined) ?? undefined,
        page,
        pageSize,
      }),
      getCollections(),
      getDistinctBrands(),
    ]);
  } catch {
    // Supabase not configured — show empty state.
  }

  const totalPages = Math.max(1, Math.ceil(products.total / pageSize));

  return (
    <div className="container-wide py-10">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-4xl tracking-tight md:text-5xl">Shop</h1>
        <p className="text-sm text-muted-foreground">
          {products.total} {products.total === 1 ? "watch" : "watches"} in the collection.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <ShopFilters
          collections={collections}
          brands={brands}
          conditionGrades={[...conditionGrades]}
        />
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <ShopSort />
          </div>

          {products.products.length === 0 ? (
            <div className="rounded-md border border-dashed p-12 text-center text-muted-foreground">
              <p>No watches match these filters.</p>
              <Link href="/shop" className="mt-2 inline-block text-sm underline">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {products.products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 3} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-10 flex items-center justify-center gap-2 text-sm"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                const qs = new URLSearchParams();
                for (const [k, v] of Object.entries(sp)) {
                  if (typeof v === "string") qs.set(k, v);
                }
                qs.set("page", String(n));
                const isCurrent = n === page;
                return (
                  <Link
                    key={n}
                    href={`/shop?${qs.toString()}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`min-w-[40px] rounded-md border px-3 py-2 text-center ${
                      isCurrent ? "bg-foreground text-background" : "hover:bg-muted"
                    }`}
                  >
                    {n}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
