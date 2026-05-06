"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ImportButton({ igPostId }: { igPostId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function importPost() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/instagram/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagram_post_id: igPostId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "import_failed");
      toast.success("Created product draft.");
      router.push(`/admin/products/${body.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button size="sm" variant="outline" className="w-full" onClick={importPost} disabled={busy}>
      {busy ? "Importing…" : "Import as draft"}
    </Button>
  );
}
