import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const result = await getActiveProducts({
    brand: params.get("brand") ?? undefined,
    category: params.get("category") ?? undefined,
    collectionSlug: params.get("collection") ?? undefined,
    conditionGrade: params.get("condition") ?? undefined,
    minPrice: params.get("min_price") ? Number(params.get("min_price")) : undefined,
    maxPrice: params.get("max_price") ? Number(params.get("max_price")) : undefined,
    status: (params.get("status") as "active" | "sold" | "all" | null) ?? undefined,
    search: params.get("q") ?? undefined,
    sort: (params.get("sort") as "newest" | "price_asc" | "price_desc" | "most_viewed" | null) ?? undefined,
    page: params.get("page") ? Number(params.get("page")) : undefined,
    pageSize: params.get("page_size") ? Number(params.get("page_size")) : undefined,
  });

  return NextResponse.json(result);
}
