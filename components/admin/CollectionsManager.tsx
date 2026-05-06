"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Collection } from "@/types/database";
import { slugify } from "@/lib/utils/format";

interface Props {
  initial: Collection[];
}

export function CollectionsManager({ initial }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slugify(name),
          description: description || null,
          display_order: initial.length,
          is_active: true,
        }),
      });
      if (!res.ok) throw new Error("create_failed");
      toast.success("Collection created.");
      setName("");
      setDescription("");
      setCreating(false);
      router.refresh();
    } catch {
      toast.error("Could not create");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this collection? Watches will keep their products.")) return;
    const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted.");
      router.refresh();
    } else toast.error("Delete failed");
  }

  async function patch(id: string, body: Partial<Collection>) {
    const orig = initial.find((c) => c.id === id);
    if (!orig) return;
    const merged = { ...orig, ...body };
    const res = await fetch(`/api/admin/collections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: merged.name,
        slug: merged.slug,
        description: merged.description,
        cover_image_url: merged.cover_image_url,
        display_order: merged.display_order,
        is_active: merged.is_active,
      }),
    });
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-secondary/40 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Order</th>
              <th className="p-3">Active</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initial.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No collections yet.
                </td>
              </tr>
            )}
            {initial.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3">{c.display_order}</td>
                <td className="p-3">
                  <Checkbox
                    checked={c.is_active}
                    onCheckedChange={(v) => patch(c.id, { is_active: Boolean(v) })}
                  />
                </td>
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
        <div className="space-y-3 rounded-md border bg-background p-4">
          <div>
            <Label className="mb-1.5 block">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Description (optional)</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={create} disabled={busy}>{busy ? "Creating…" : "Create"}</Button>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> New collection
        </Button>
      )}
    </div>
  );
}
