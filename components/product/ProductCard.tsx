import Image from "next/image";
import Link from "next/link";
import { ConditionBadge } from "@/components/product/ConditionBadge";
import { formatPrice } from "@/lib/utils/format";
import { getServerCurrency } from "@/lib/utils/format-server";
import { cn } from "@/lib/utils/cn";
import type { ProductWithImages } from "@/types/database";

interface ProductCardProps {
  product: ProductWithImages;
  priority?: boolean;
}

export async function ProductCard({ product, priority = false }: ProductCardProps) {
  const currency = await getServerCurrency();
  const primaryImage = product.images[0]?.image_url;
  const secondaryImage = product.images[1]?.image_url;
  const isSold = product.status === "sold";
  const isReserved = product.status === "reserved";

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`View ${product.brand} ${product.name}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
        {primaryImage ? (
          <>
            <Image
              src={primaryImage}
              alt={`${product.brand} ${product.name}`}
              fill
              sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"
              priority={priority}
              className={cn(
                "object-cover transition-opacity duration-500",
                secondaryImage ? "group-hover:opacity-0" : "",
                isSold && "opacity-70",
              )}
            />
            {secondaryImage && (
              <Image
                src={secondaryImage}
                alt=""
                aria-hidden
                fill
                sizes="(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-wide text-muted-foreground">
            No image
          </div>
        )}

        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-sm bg-foreground/90 px-3 py-1 font-display text-lg uppercase tracking-[0.2em] text-background">
              Sold
            </span>
          </div>
        )}
        {isReserved && (
          <div className="absolute right-3 top-3 rounded-sm bg-foreground/85 px-2 py-1 text-xs uppercase tracking-wider text-background">
            Reserved
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </span>
          <ConditionBadge grade={product.condition_grade} />
        </div>
        <h3 className="truncate font-display text-base leading-tight">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          {product.offer_price && product.offer_price < product.price ? (
            <>
              <span className="text-sm font-medium">{formatPrice(product.offer_price, currency)}</span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price, currency)}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium">{formatPrice(product.price, currency)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
