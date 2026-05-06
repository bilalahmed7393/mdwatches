import { createAdminClient } from "@/lib/supabase/admin";
import type { WaitlistEntry } from "@/types/database";
import { formatDate, buildWhatsappLink } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Waitlist" };

export default async function AdminWaitlistPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("waitlist").select("*, product:products(name, brand)").order("created_at", { ascending: false });
  const entries = (data ?? []) as unknown as (WaitlistEntry & { product: { name: string; brand: string } | null })[];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Waitlist</h1>
        <p className="text-sm text-muted-foreground">{entries.length} entries</p>
      </div>
      <div className="rounded-md border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-secondary/40 text-left">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Watch</th>
              <th className="p-3">Notify</th>
              <th className="p-3">Date</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entries.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No waitlist entries yet.</td></tr>
            )}
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="p-3">
                  <div className="font-medium">{e.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{e.customer_email}</div>
                </td>
                <td className="p-3">
                  {e.is_general_newsletter ? (
                    <span className="text-muted-foreground">— Newsletter —</span>
                  ) : e.product ? (
                    `${e.product.brand} ${e.product.name}`
                  ) : (
                    <span className="text-muted-foreground">(deleted)</span>
                  )}
                </td>
                <td className="p-3">{e.notification_preference}</td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(e.created_at)}</td>
                <td className="p-3 text-right">
                  {e.customer_phone && (
                    <a
                      href={buildWhatsappLink(e.customer_phone, "Hi from MD Watches!")}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs underline"
                    >
                      WhatsApp
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
