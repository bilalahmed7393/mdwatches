"use client";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PaymentProofViewer({ path }: { path: string }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.storage
      .from("payment-proofs")
      .createSignedUrl(path, 60 * 10)
      .then(({ data }) => {
        if (data?.signedUrl) setSignedUrl(data.signedUrl);
      });
  }, [path]);

  return (
    <div className="rounded-md border bg-secondary/30 p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">Payment proof uploaded</span>
        {signedUrl && (
          <a
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-xs text-muted-foreground hover:underline"
          >
            View <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
