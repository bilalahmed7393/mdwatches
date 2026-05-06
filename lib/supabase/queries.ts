import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Collection,
  ProductImage,
  ProductWithImages,
  SiteSetting,
} from "@/types/database";

type RowWithImages = ProductWithImages & { images?: ProductImage[] };

function attachImages(rows: RowWithImages[] | null | undefined): ProductWithImages[] {
  return (rows ?? []).map((p) => ({
    ...p,
    images: (p.images ?? []).slice().sort(
      (a, b) =>
        Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order,
    ),
  }));
}

export async function getActiveProducts(opts: {
  brand?: string;
  category?: string;
  collectionSlug?: string;
  conditionGrade?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: "active" | "sold" | "all";
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "most_viewed";
  page?: number;
  pageSize?: number;
} = {}): Promise<{ products: ProductWithImages[]; total: number }> {
  const supabase = await createClient();
  const pageSize = opts.pageSize ?? 12;
  const page = Math.max(opts.page ?? 1, 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select("*, images:product_images(*), collection:collections(*)", { count: "exact" });

  if (opts.status === "active") {
    query = query.eq("status", "active");
  } else if (opts.status === "sold") {
    query = query.eq("status", "sold");
  } else {
    query = query.in("status", ["active", "sold", "reserved"]);
  }

  if (opts.brand) query = query.eq("brand", opts.brand);
  if (opts.category) query = query.eq("category", opts.category);
  if (opts.conditionGrade) query = query.eq("condition_grade", opts.conditionGrade);
  if (typeof opts.minPrice === "number") query = query.gte("price", opts.minPrice);
  if (typeof opts.maxPrice === "number") query = query.lte("price", opts.maxPrice);
  if (opts.search) {
    query = query.or(
      `name.ilike.%${opts.search}%,brand.ilike.%${opts.search}%,model.ilike.%${opts.search}%,reference_number.ilike.%${opts.search}%`,
    );
  }
  if (opts.collectionSlug) {
    const { data: c } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", opts.collectionSlug)
      .single();
    const cid = (c as { id?: string } | null)?.id;
    if (cid) query = query.eq("collection_id", cid);
  }

  switch (opts.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "most_viewed":
      query = query.order("views_count", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  return { products: attachImages(data as unknown as RowWithImages[]), total: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<ProductWithImages | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, images:product_images(*), collection:collections(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return attachImages([data as unknown as RowWithImages])[0];
}

export async function getRelatedProducts(productId: string, brand: string, limit = 4) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("brand", brand)
    .neq("id", productId)
    .in("status", ["active", "sold"])
    .order("created_at", { ascending: false })
    .limit(limit);
  return attachImages(data as unknown as RowWithImages[]);
}

export async function getFeaturedProducts(limit = 6): Promise<ProductWithImages[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("is_featured", true)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);
  return attachImages(data as unknown as RowWithImages[]);
}

export async function getNewArrivals(limit = 8): Promise<ProductWithImages[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, images:product_images(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);
  return attachImages(data as unknown as RowWithImages[]);
}

export async function getCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  return (data ?? []) as unknown as Collection[];
}

export async function getSiteSettings(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const out: Record<string, string> = {};
  for (const row of (data as unknown as Pick<SiteSetting, "key" | "value">[]) ?? []) {
    if (row.value != null) out[row.key] = row.value;
  }
  return out;
}

export async function getDistinctBrands(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("brand")
    .in("status", ["active", "sold"]);
  const set = new Set<string>();
  for (const row of (data as unknown as { brand: string }[]) ?? []) {
    if (row.brand) set.add(row.brand);
  }
  return Array.from(set).sort();
}
