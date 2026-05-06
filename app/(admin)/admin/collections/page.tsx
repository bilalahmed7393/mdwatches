import { CollectionsManager } from "@/components/admin/CollectionsManager";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Collection } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Collections" };

export default async function AdminCollectionsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("collections").select("*").order("display_order", { ascending: true });
  const collections = (data ?? []) as unknown as Collection[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Collections</h1>
        <p className="text-sm text-muted-foreground">Group watches into themed collections.</p>
      </div>
      <CollectionsManager initial={collections} />
    </div>
  );
}
