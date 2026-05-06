import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils/format";
import type { Product, ProductImage } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Products" };

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const supabase = createAdminClient();
  let query = supabase
    .from("products")
    .select("*, images:product_images(*)")
    .order("created_at", { ascending: false });
  if (sp.status) query = query.eq("status", sp.status);
  if (sp.q) query = query.ilike("name", `%${sp.q}%`);

  const { data } = await query;
  const products = (data ?? []) as unknown as (Product & { images: ProductImage[] })[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "watch" : "watches"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add product
          </Link>
        </Button>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 text-xs">
        {["all", "active", "draft", "sold", "reserved"].map((s) => {
          const isActive =
            (s === "all" && !sp.status) || sp.status === s;
          return (
            <Link
              key={s}
              href={s === "all" ? "/admin/products" : `/admin/products?status=${s}`}
              className={`rounded-full border px-3 py-1 ${
                isActive ? "bg-foreground text-background" : "hover:bg-muted"
              }`}
            >
              {s}
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-md border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-secondary/40 text-left">
            <tr>
              <th className="p-3"></th>
              <th className="p-3">Watch</th>
              <th className="p-3">Brand</th>
              <th className="p-3">Status</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Price</th>
              <th className="p-3">Featured</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No products yet.{" "}
                  <Link href="/admin/products/new" className="underline">Add your first watch.</Link>
                </td>
              </tr>
            )}
            {products.map((p) => {
              const cover = p.images?.find((i) => i.is_primary)?.image_url ?? p.images?.[0]?.image_url;
              return (
                <tr key={p.id} className="hover:bg-secondary/30">
                  <td className="p-3">
                    {cover ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                        <Image src={cover} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-muted" />
                    )}
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                    {p.reference_number && (
                      <div className="text-xs text-muted-foreground">{p.reference_number}</div>
                    )}
                  </td>
                  <td className="p-3">{p.brand}</td>
                  <td className="p-3">
                    <Badge variant={p.status === "active" ? "default" : "outline"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="p-3">{p.stock_quantity}</td>
                  <td className="p-3">{formatPrice(p.price)}</td>
                  <td className="p-3">{p.is_featured ? "★" : "—"}</td>
                  <td className="p-3 text-right">
                    <ProductRowActions productId={p.id} slug={p.slug} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
