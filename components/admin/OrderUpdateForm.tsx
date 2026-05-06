"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OrderStatus } from "@/types/database";

const STATUSES: OrderStatus[] = [
  "pending",
  "payment_submitted",
  "payment_confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

interface Props {
  orderId: string;
  initialStatus: OrderStatus;
  initialTracking: string | null;
  initialNotes: string | null;
}

export function OrderUpdateForm({ orderId, initialStatus, initialTracking, initialNotes }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [tracking, setTracking] = useState(initialTracking ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          tracking_number: tracking || null,
          admin_notes: notes || null,
        }),
      });
      if (!res.ok) throw new Error("save_failed");
      toast.success("Order updated.");
      router.refresh();
    } catch {
      toast.error("Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border bg-background p-5 space-y-4">
      <h2 className="font-display text-lg">Update order</h2>
      <div>
        <Label className="mb-1.5 block">Status</Label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="h-11 w-full rounded-md border bg-background px-3 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>
      <div>
        <Label className="mb-1.5 block">Tracking number</Label>
        <Input value={tracking} onChange={(e) => setTracking(e.target.value)} />
      </div>
      <div>
        <Label className="mb-1.5 block">Internal notes</Label>
        <Textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes visible only to admins."
        />
      </div>
      <Button className="w-full" onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
