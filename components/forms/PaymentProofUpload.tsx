"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface PaymentProofUploadProps {
  orderId: string;
  initial?: string | null;
}

export function PaymentProofUpload({ orderId, initial }: PaymentProofUploadProps) {
  const [uploaded, setUploaded] = useState<string | null>(initial ?? null);
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${orderId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("payment-proofs")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      // Persist on the order via admin endpoint (or direct here? — we go through API)
      const res = await fetch(`/api/orders/${orderId}/payment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      if (!res.ok) throw new Error("save_failed");
      setUploaded(path);
      toast.success("Payment proof uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <label className="inline-flex">
        <Button asChild variant="outline" size="sm" disabled={busy}>
          <span>
            {uploaded ? (
              <><FileCheck className="mr-2 h-4 w-4" /> Replace file</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" /> {busy ? "Uploading…" : "Choose file"}</>
            )}
          </span>
        </Button>
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={onChange}
          disabled={busy}
        />
      </label>
      {uploaded && (
        <p className="mt-2 text-xs text-muted-foreground">
          Uploaded · pending admin review.
        </p>
      )}
    </div>
  );
}
