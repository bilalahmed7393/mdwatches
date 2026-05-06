import Image from "next/image";
import Link from "next/link";
import { getCollections } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Collections",
  description: "Browse pre-loved watches by collection.",
};

export default async function CollectionsPage() {
  let collections: Awaited<ReturnType<typeof getCollections>> = [];
  try {
    collections = await getCollections();
  } catch {}
  return (
    <div className="container-wide py-10">
      <h1 className="font-display text-4xl tracking-tight md:text-5xl">Collections</h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Curated groupings — luxury, vintage, daily, and the rare oddballs.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                sizes="(max-width:1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-background">
              <h2 className="font-display text-2xl">{c.name}</h2>
              {c.description && (
                <p className="mt-1 text-sm opacity-90">{c.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
