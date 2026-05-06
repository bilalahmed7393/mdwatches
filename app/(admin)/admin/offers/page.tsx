import { OffersTable } from "@/components/admin/OffersTable";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Offer, Product } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Offers" };

export default async function AdminOffersPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("offers")
    .select("*, product:products(name, brand, price)")
    .order("created_at", { ascending: false });
  const offers = (data ?? []) as unknown as (Offer & { product: Pick<Product, "name" | "brand" | "price"> | null })[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Offers</h1>
        <p className="text-sm text-muted-foreground">{offers.length} total</p>
      </div>
      <OffersTable offers={offers} />
    </div>
  );
}
