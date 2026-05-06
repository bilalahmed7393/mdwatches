"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Offer, Product } from "@/types/database";
import { formatDate, formatPrice } from "@/lib/utils/format";

type Row = Offer & { product: Pick<Product, "name" | "brand" | "price"> | null };

export function OffersTable({ offers }: { offers: Row[] }) {
  const router = useRouter();
  const [counter, setCounter] = useState<{ id: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function update(id: string, status: Offer["status"], message?: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_response: message ?? null }),
      });
      if (!res.ok) throw new Error("update_failed");
      toast.success("Offer updated.");
      router.refresh();
      setCounter(null);
    } catch {
      toast.error("Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-secondary/40 text-left">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Watch</th>
              <th className="p-3">Listed</th>
              <th className="p-3">Offered</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {offers.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No offers yet.
                </td>
              </tr>
            )}
            {offers.map((o) => (
              <tr key={o.id} className="align-top">
                <td className="p-3">
                  <div className="font-medium">{o.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                </td>
                <td className="p-3">
                  {o.product?.brand} {o.product?.name}
                </td>
                <td className="p-3">{o.product ? formatPrice(o.product.price) : "—"}</td>
                <td className="p-3 font-medium">{formatPrice(o.offered_price)}</td>
                <td className="p-3">
                  <Badge variant="outline">{o.status}</Badge>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{formatDate(o.created_at)}</td>
                <td className="p-3 text-right">
                  {o.status === "pending" ? (
                    <div className="flex justify-end gap-1">
                      <Button size="sm" onClick={() => update(o.id, "accepted")} disabled={busy}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setCounter({ id: o.id, message: "" })}>
                        Counter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => update(o.id, "rejected")}
                        disabled={busy}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(counter)} onOpenChange={(o) => !o && setCounter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Counter offer</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder="Your counter (e.g. 'Best we can do is $4,800')."
            value={counter?.message ?? ""}
            onChange={(e) => counter && setCounter({ ...counter, message: e.target.value })}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCounter(null)}>Cancel</Button>
            <Button
              onClick={() => counter && update(counter.id, "countered", counter.message)}
              disabled={busy}
            >
              Send counter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
