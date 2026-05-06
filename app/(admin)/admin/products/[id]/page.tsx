import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Collection, Product, ProductImage } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const [productRes, imagesRes, collectionsRes] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("display_order", { ascending: true }),
    supabase.from("collections").select("*").order("display_order"),
  ]);

  const product = productRes.data as unknown as Product | null;
  if (!product) notFound();

  const images = (imagesRes.data ?? []) as unknown as ProductImage[];
  const collections = (collectionsRes.data ?? []) as unknown as Collection[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{product.name}</h1>
          <p className="text-sm text-muted-foreground">Edit product</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/shop/${product.slug}`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" /> View on site
          </Link>
        </Button>
      </div>
      <ProductForm
        collections={collections}
        initial={{ ...product, id: product.id }}
        initialImages={images}
      />
    </div>
  );
}
