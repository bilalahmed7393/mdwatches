import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container-narrow flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">404</p>
      <h1 className="font-display text-5xl tracking-tight">Lost in time.</h1>
      <p className="max-w-md text-muted-foreground">
        The page you're looking for has slipped off the wrist. Let's get you back to the shop.
      </p>
      <Button asChild variant="accent">
        <Link href="/shop">Back to shop</Link>
      </Button>
    </main>
  );
}
