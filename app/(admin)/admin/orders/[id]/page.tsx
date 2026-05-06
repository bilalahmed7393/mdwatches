import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderUpdateForm } from "@/components/admin/OrderUpdateForm";
import { PaymentProofViewer } from "@/components/admin/PaymentProofViewer";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, Product } from "@/types/database";
import { formatDate, formatPrice, buildWhatsappLink } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Order detail" };

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, product:products(*)")
    .eq("id", id)
    .maybeSingle();
  const order = data as unknown as (Order & { product: Product | null }) | null;
  if (!order) notFound();

  const waMsg = `Hi ${order.customer_name}, this is MD Watches regarding order ${order.order_number}.`;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="text-xs text-muted-foreground hover:underline">
          ← All orders
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="font-display text-3xl tracking-tight">{order.order_number}</h1>
          <Badge variant="outline">{order.status.replace(/_/g, " ")}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        <div className="space-y-4 rounded-md border bg-background p-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Customer" value={order.customer_name} />
            <Field label="Placed" value={formatDate(order.created_at)} />
            <Field label="Email" value={order.customer_email} />
            <Field label="Phone" value={order.customer_phone} />
            <div className="col-span-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Delivery address
              </div>
              <div className="mt-1 whitespace-pre-line">{order.delivery_address}</div>
            </div>
          </div>

          <hr />

          {order.product && (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Product</div>
              <Link href={`/admin/products/${order.product.id}`} className="font-medium hover:underline">
                {order.product.brand} {order.product.name}
              </Link>
              {order.product.reference_number && (
                <div className="text-xs text-muted-foreground">
                  Ref. {order.product.reference_number}
                </div>
              )}
            </div>
          )}

          <div className="flex items-baseline justify-between border-t pt-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-2xl">{formatPrice(order.final_price)}</span>
          </div>

          {order.payment_proof_url && (
            <PaymentProofViewer path={order.payment_proof_url} />
          )}

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a
                href={buildWhatsappLink(order.customer_phone, waMsg)}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="mr-2 h-3 w-3" /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={`mailto:${order.customer_email}?subject=${encodeURIComponent(order.order_number)}`}>
                Email
              </a>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <OrderUpdateForm
            orderId={order.id}
            initialStatus={order.status}
            initialTracking={order.tracking_number}
            initialNotes={order.admin_notes}
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
