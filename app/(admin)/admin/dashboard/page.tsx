import Link from "next/link";
import {
  ArrowRight,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DashboardStats, Order, Offer } from "@/types/database";
import { formatPrice, formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createAdminClient();

  const [statsRes, recentOrdersRes, recentOffersRes] = await Promise.all([
    supabase.from("admin_dashboard_stats").select("*").single(),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("offers").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = (statsRes.data as DashboardStats | null) ?? null;
  const recentOrders = (recentOrdersRes.data as Order[] | null) ?? [];
  const recentOffers = (recentOffersRes.data as Offer[] | null) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Quick overview of the shop.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/products/new">+ Add product</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/orders">Manage orders</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KPI label="Active" value={stats?.active_products ?? 0} icon={Package} />
        <KPI label="Sold" value={stats?.sold_products ?? 0} icon={Package} />
        <KPI label="Pending orders" value={stats?.pending_orders ?? 0} icon={Clock} />
        <KPI label="Today" value={stats?.orders_today ?? 0} icon={ShoppingCart} />
        <KPI label="Pending offers" value={stats?.pending_offers ?? 0} icon={Mail} />
        <KPI
          label="Confirmed revenue"
          value={formatPrice(stats?.confirmed_revenue ?? 0)}
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg">Recent orders</h2>
              <Link href="/admin/orders" className="text-xs text-muted-foreground hover:underline">
                View all <ArrowRight className="ml-1 inline h-3 w-3" />
              </Link>
            </div>
            <ul className="divide-y">
              {recentOrders.length === 0 && (
                <li className="py-4 text-sm text-muted-foreground">No orders yet.</li>
              )}
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                    <div className="font-medium">{o.order_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.customer_name} · {formatDate(o.created_at)}
                    </div>
                  </Link>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(o.final_price)}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.status.replace(/_/g, " ")}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg">Recent offers</h2>
              <Link href="/admin/offers" className="text-xs text-muted-foreground hover:underline">
                View all <ArrowRight className="ml-1 inline h-3 w-3" />
              </Link>
            </div>
            <ul className="divide-y">
              {recentOffers.length === 0 && (
                <li className="py-4 text-sm text-muted-foreground">No offers yet.</li>
              )}
              {recentOffers.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(o.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(o.offered_price)}</div>
                    <div className="text-xs text-muted-foreground">{o.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Clock;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-2xl">{value}</div>
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
