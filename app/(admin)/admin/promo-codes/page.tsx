import { PromoCodesManager } from "@/components/admin/PromoCodesManager";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PromoCode } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Promo codes" };

export default async function AdminPromoCodesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
  const codes = (data ?? []) as unknown as PromoCode[];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Promo codes</h1>
        <p className="text-sm text-muted-foreground">{codes.length} codes</p>
      </div>
      <PromoCodesManager initial={codes} />
    </div>
  );
}
