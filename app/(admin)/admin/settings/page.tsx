import { SettingsForm } from "@/components/admin/SettingsForm";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SiteSetting } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Settings" };

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("site_settings").select("*").order("section");
  const settings = (data ?? []) as unknown as SiteSetting[];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Site settings</h1>
        <p className="text-sm text-muted-foreground">
          Edit homepage content, contact details, bank info, SEO, and more.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
