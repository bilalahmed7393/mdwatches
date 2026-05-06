"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function InstagramSyncBar() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function sync() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/instagram/sync", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "sync_failed");
      if (body.skipped) toast.warning(body.reason ?? "Sync skipped");
      else toast.success(`Synced ${body.synced ?? 0} posts.`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button onClick={sync} disabled={busy}>
      <RefreshCw className={`mr-2 h-4 w-4 ${busy ? "animate-spin" : ""}`} />
      {busy ? "Syncing…" : "Sync Instagram"}
    </Button>
  );
}
