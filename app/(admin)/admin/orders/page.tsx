import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, Product } from "@/types/database";
import { formatDate, formatPrice } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Orders" };

const STATUS_COLUMNS: { key: Order["status"]; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "payment_submitted", label: "Payment submitted" },
  { key: "payment_confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, product:products(name, brand)")
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as unknown as (Order & { product: Pick<Product, "name" | "brand"> | null })[];

  const buckets = STATUS_COLUMNS.map((col) => ({
    ...col,
    items: orders.filter((o) => o.status === col.key),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} total</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {buckets.map((b) => (
          <div key={b.key} className="rounded-md border bg-background p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm uppercase tracking-wider">{b.label}</h2>
              <Badge variant="outline">{b.items.length}</Badge>
            </div>
            <ul className="space-y-2">
              {b.items.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="block rounded-md border bg-secondary/40 p-3 transition hover:bg-secondary"
                  >
                    <div className="text-xs text-muted-foreground">{o.order_number}</div>
                    <div className="font-medium">
                      {o.product?.brand} {o.product?.name}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span>{o.customer_name}</span>
                      <span>{formatPrice(o.final_price)}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDate(o.created_at)}
                    </div>
                  </Link>
                </li>
              ))}
              {b.items.length === 0 && (
                <li className="text-xs text-muted-foreground">—</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
