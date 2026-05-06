import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { HeaderNav, type HeaderNavData } from "@/components/layout/HeaderNav";
import { Button } from "@/components/ui/button";
import { getCollections, getDistinctBrands } from "@/lib/supabase/queries";

const FALLBACK_CATEGORIES = ["Diver", "Dress", "Sport", "Chronograph", "Pilot", "Vintage"];

async function getNavData(): Promise<HeaderNavData> {
  try {
    const [brands, collections] = await Promise.all([
      getDistinctBrands(),
      getCollections(),
    ]);
    return {
      brands,
      categories: FALLBACK_CATEGORIES,
      collections: collections.map((c) => ({ slug: c.slug, name: c.name })),
    };
  } catch {
    return { brands: [], categories: FALLBACK_CATEGORIES, collections: [] };
  }
}

export async function Header() {
  const data = await getNavData();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MobileNav navData={data} />
          <Link href="/" aria-label="MD Watches home" className="flex items-center gap-2">
            <Image
              src="/brand/md-watches-mark.png"
              alt=""
              width={36}
              height={36}
              priority
              className="h-9 w-auto"
            />
            <span className="font-display text-lg tracking-[0.2em] hidden sm:inline">
              MD WATCHES
            </span>
          </Link>
        </div>

        <HeaderNav {...data} />

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Search">
            <Link href="/shop">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
