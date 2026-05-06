import { notFound } from "next/navigation";
import { Check, Clock, Package, Truck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PaymentProofUpload } from "@/components/forms/PaymentProofUpload";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/lib/supabase/queries";
import { formatPrice, formatDate } from "@/lib/utils/format";
import type { Order, Product } from "@/types/database";

export const dynamic = "force-dynamic";

const STATUS_STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "payment_submitted", label: "Payment submitted", icon: Clock },
  { key: "payment_confirmed", label: "Payment confirmed", icon: Check },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  let order: (Order & { product: Product | null }) | null = null;
  let settings: Record<string, string> = {};
  try {
    const { data } = await supabase
      .from("orders")
      .select("*, product:products(*)")
      .eq("id", id)
      .maybeSingle();
    order = data as unknown as (Order & { product: Product | null }) | null;
    settings = await getSiteSettings();
  } catch {}
  if (!order) notFound();

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="container-narrow py-12">
      <div className="rounded-md border bg-card p-6 md:p-8">
        <div className="flex flex-col gap-2 border-b pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Order received
            </p>
            <h1 className="font-display text-3xl tracking-tight">
              {order.order_number}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {formatDate(order.created_at)}
            </p>
          </div>
          <Badge variant={order.status === "delivered" ? "default" : "outline"} className="self-start">
            {order.status.replace(/_/g, " ")}
          </Badge>
        </div>

        {/* Product */}
        {order.product && (
          <div className="border-b py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl">
                  {order.product.brand} {order.product.name}
                </h2>
                {order.product.reference_number && (
                  <p className="text-sm text-muted-foreground">
                    Ref. {order.product.reference_number}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="font-display text-2xl">{formatPrice(order.final_price)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Status timeline */}
        <div className="border-b py-6">
          <h3 className="font-display text-base">Status</h3>
          <ol className="mt-4 grid grid-cols-5 gap-2">
            {STATUS_STEPS.map((s, i) => {
              const Icon = s.icon;
              const reached = i <= currentIdx;
              return (
                <li key={s.key} className="flex flex-col items-center text-center">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                      reached ? "border-foreground bg-foreground text-background" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className={`mt-2 text-xs ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ol>
          {order.tracking_number && (
            <p className="mt-4 rounded-md border bg-secondary/40 p-3 text-sm">
              <Package className="mr-2 inline h-4 w-4" /> Tracking: {order.tracking_number}
            </p>
          )}
        </div>

        {/* Bank transfer instructions */}
        {(order.status === "pending" || order.status === "payment_submitted") && (
          <div className="border-b py-6">
            <h3 className="font-display text-base">Bank transfer instructions</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your order reference <b>{order.order_number}</b> as the transfer description.
            </p>
            <dl className="mt-4 grid grid-cols-1 gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
              <Detail label="Bank" value={settings["bank.bank_name"] ?? "TODO: owner input"} />
              <Detail label="Account name" value={settings["bank.account_name"] ?? "TODO: owner input"} />
              <Detail label="Account number" value={settings["bank.account_number"] ?? "TODO: owner input"} />
              {settings["bank.swift_code"] && (
                <Detail label="SWIFT" value={settings["bank.swift_code"]} />
              )}
              <Detail label="Amount" value={formatPrice(order.final_price)} />
              <Detail label="Reference" value={order.order_number} />
            </dl>
            {settings["bank.instructions"] && (
              <p className="mt-3 text-xs text-muted-foreground">{settings["bank.instructions"]}</p>
            )}

            <div className="mt-6">
              <h4 className="font-medium">Upload payment proof (optional)</h4>
              <p className="text-xs text-muted-foreground">
                Speeds up confirmation. PDF, PNG, or JPEG up to 10MB.
              </p>
              <PaymentProofUpload orderId={order.id} initial={order.payment_proof_url} />
            </div>
          </div>
        )}

        <div className="pt-6 text-sm text-muted-foreground">
          We'll be in touch via email or WhatsApp once payment is confirmed.
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
