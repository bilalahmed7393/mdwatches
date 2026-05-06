"use client";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-narrow flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-xs uppercase tracking-wider text-destructive">Error</p>
      <h1 className="font-display text-4xl tracking-tight">Something went wrong.</h1>
      <p className="max-w-md text-muted-foreground">
        We've been notified and are looking into it. Please try again.
      </p>
      <Button onClick={() => reset()} variant="accent">
        Try again
      </Button>
    </main>
  );
}
