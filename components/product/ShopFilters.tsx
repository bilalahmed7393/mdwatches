"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Collection } from "@/types/database";

interface ShopFiltersProps {
  collections: Collection[];
  brands: string[];
  conditionGrades: string[];
}

export function ShopFilters({ collections, brands, conditionGrades }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function update(key: string, value: string | null) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") sp.delete(key);
    else sp.set(key, value);
    sp.delete("page");
    startTransition(() => router.push(`/shop?${sp.toString()}`));
  }

  const Filters = (
    <div className="space-y-6">
      <div>
        <Label htmlFor="search" className="mb-2 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            type="search"
            placeholder="Brand, name, reference…"
            defaultValue={searchParams.get("q") ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              clearTimeout((window as unknown as { __md_q_t?: ReturnType<typeof setTimeout> }).__md_q_t);
              (window as unknown as { __md_q_t?: ReturnType<typeof setTimeout> }).__md_q_t = setTimeout(() => update("q", v), 300);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Brand</Label>
        <select
          className="h-11 w-full rounded-md border bg-background px-3 text-sm"
          value={searchParams.get("brand") ?? ""}
          onChange={(e) => update("brand", e.target.value || null)}
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div>
        <Label className="mb-2 block">Collection</Label>
        <select
          className="h-11 w-full rounded-md border bg-background px-3 text-sm"
          value={searchParams.get("collection") ?? ""}
          onChange={(e) => update("collection", e.target.value || null)}
        >
          <option value="">All collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <Label className="mb-2 block">Condition</Label>
        <select
          className="h-11 w-full rounded-md border bg-background px-3 text-sm"
          value={searchParams.get("condition") ?? ""}
          onChange={(e) => update("condition", e.target.value || null)}
        >
          <option value="">Any condition</option>
          {conditionGrades.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="min-price" className="mb-2 block">Min $</Label>
          <Input
            id="min-price"
            type="number"
            inputMode="numeric"
            placeholder="0"
            defaultValue={searchParams.get("min_price") ?? ""}
            onBlur={(e) => update("min_price", e.target.value || null)}
          />
        </div>
        <div>
          <Label htmlFor="max-price" className="mb-2 block">Max $</Label>
          <Input
            id="max-price"
            type="number"
            inputMode="numeric"
            placeholder="∞"
            defaultValue={searchParams.get("max_price") ?? ""}
            onBlur={(e) => update("max_price", e.target.value || null)}
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Availability</Label>
        <select
          className="h-11 w-full rounded-md border bg-background px-3 text-sm"
          value={searchParams.get("status") ?? "active"}
          onChange={(e) => update("status", e.target.value === "active" ? null : e.target.value)}
        >
          <option value="active">In stock</option>
          <option value="sold">Sold archive</option>
          <option value="all">All</option>
        </select>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => router.push("/shop")}
      >
        <X className="mr-2 h-4 w-4" /> Clear filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{Filters}</div>
          </SheetContent>
        </Sheet>
      </div>
      {/* Desktop sidebar */}
      <aside className="hidden md:block">{Filters}</aside>
    </>
  );
}
