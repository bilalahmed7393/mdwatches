"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { PromoCode } from "@/types/database";

export function PromoCodesManager({ initial }: { initial: PromoCode[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 10,
    min_order_value: "",
    max_uses: "",
    expires_at: "",
    is_active: true,
  });

  async function create() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          min_order_value: form.min_order_value ? Number(form.min_order_value) : null,
          max_uses: form.max_uses ? Number(form.max_uses) : null,
          expires_at: form.expires_at || null,
          is_active: form.is_active,
        }),
      });
      if (!res.ok) throw new Error("create_failed");
      toast.success("Code created.");
      setCreating(false);
      router.refresh();
    } catch {
      toast.error("Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this code?")) return;
    const res = await fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted.");
      router.refresh();
    } else toast.error("Delete failed");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-secondary/40 text-left">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Min</th>
              <th className="p-3">Used</th>
              <th className="p-3">Active</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initial.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No codes yet.</td></tr>
            )}
            {initial.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-mono uppercase">{c.code}</td>
                <td className="p-3">
                  {c.discount_type === "percentage" ? `${c.discount_value}%` : `$${c.discount_value}`}
                </td>
                <td className="p-3">{c.min_order_value ? `$${c.min_order_value}` : "—"}</td>
                <td className="p-3">
                  {c.current_uses}{c.max_uses ? ` / ${c.max_uses}` : ""}
                </td>
                <td className="p-3">{c.is_active ? "✓" : "—"}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating ? (
        <div className="grid grid-cols-2 gap-3 rounded-md border bg-background p-4">
          <div>
            <Label className="mb-1.5 block">Code</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <Label className="mb-1.5 block">Type</Label>
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value as "percentage" | "fixed" })}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="percentage">% off</option>
              <option value="fixed">Fixed $</option>
            </select>
          </div>
          <div>
            <Label className="mb-1.5 block">Value</Label>
            <Input
              type="number"
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Min order value ($)</Label>
            <Input
              type="number"
              value={form.min_order_value}
              onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Max uses</Label>
            <Input
              type="number"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Expires (ISO)</Label>
            <Input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value ? new Date(e.target.value).toISOString() : "" })}
            />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <Checkbox
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: Boolean(v) })}
            />
            <span className="text-sm">Active</span>
          </div>
          <div className="col-span-2 flex gap-2">
            <Button onClick={create} disabled={busy}>{busy ? "Creating…" : "Create"}</Button>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> New code
        </Button>
      )}
    </div>
  );
}
