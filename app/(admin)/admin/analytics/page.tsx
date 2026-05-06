import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils/format";
import { getServerCurrency } from "@/lib/utils/format-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Analytics" };

export default async function AdminAnalyticsPage() {
  const currency = await getServerCurrency();
  const supabase = createAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [eventsRes, revenueRes, viewsRes] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("event_type, created_at")
      .gte("created_at", since.toISOString()),
    supabase
      .from("orders")
      .select("final_price, status, created_at")
      .gte("created_at", since.toISOString()),
    supabase
      .from("products")
      .select("name, brand, views_count")
      .order("views_count", { ascending: false })
      .limit(10),
  ]);

  const events = (eventsRes.data ?? []) as { event_type: string; created_at: string }[];
  const orders = (revenueRes.data ?? []) as { final_price: number; status: string; created_at: string }[];
  const topViewed = (viewsRes.data ?? []) as { name: string; brand: string; views_count: number }[];

  const confirmedOrders = orders.filter((o) =>
    ["payment_confirmed", "shipped", "delivered"].includes(o.status),
  );
  const revenue = confirmedOrders.reduce((sum, o) => sum + Number(o.final_price), 0);
  const conversionRate = events.length > 0
    ? ((confirmedOrders.length / events.filter((e) => e.event_type === "product_view").length || 1) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPI label="Events" value={events.length} />
        <KPI label="Orders" value={orders.length} />
        <KPI label="Confirmed orders" value={confirmedOrders.length} />
        <KPI label="Revenue" value={formatPrice(revenue, currency)} />
      </div>

      <div className="rounded-md border bg-background p-5">
        <h2 className="mb-4 font-display text-lg">Top viewed products</h2>
        <table className="w-full text-sm">
          <thead className="border-b text-left">
            <tr>
              <th className="pb-2">Product</th>
              <th className="pb-2 text-right">Views</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {topViewed.length === 0 && (
              <tr><td colSpan={2} className="py-4 text-center text-muted-foreground">No data yet.</td></tr>
            )}
            {topViewed.map((p, i) => (
              <tr key={i}>
                <td className="py-2">{p.brand} {p.name}</td>
                <td className="py-2 text-right">{p.views_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Conversion (confirmed orders ÷ product views): {conversionRate}%
      </p>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-2xl">{value}</div>
      </CardContent>
    </Card>
  );
}
