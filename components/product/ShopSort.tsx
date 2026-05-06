"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const options = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low → high" },
  { value: "price_desc", label: "Price: high → low" },
  { value: "most_viewed", label: "Most viewed" },
];

export function ShopSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Sort by</span>
      <select
        className="h-9 rounded-md border bg-background px-3 text-sm"
        value={searchParams.get("sort") ?? "newest"}
        onChange={(e) => {
          const sp = new URLSearchParams(searchParams.toString());
          if (e.target.value === "newest") sp.delete("sort");
          else sp.set("sort", e.target.value);
          startTransition(() => router.push(`/shop?${sp.toString()}`));
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
