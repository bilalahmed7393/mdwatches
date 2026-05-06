import { ProductForm } from "@/components/admin/ProductForm";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Collection } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · New product" };

export default async function NewProductPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .order("display_order", { ascending: true });
  const collections = (data ?? []) as unknown as Collection[];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-tight">New product</h1>
      <ProductForm collections={collections} />
    </div>
  );
}
