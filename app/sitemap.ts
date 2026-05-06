import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/collections`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/about`, lastModified: new Date(), priority: 0.6 },
    { url: `${base}/contact`, lastModified: new Date(), priority: 0.6 },
  ];

  try {
    const supabase = createAdminClient();
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .in("status", ["active", "sold"]);
    const productUrls: MetadataRoute.Sitemap = ((products as { slug: string; updated_at: string }[] | null) ?? []).map(
      (p) => ({
        url: `${base}/shop/${p.slug}`,
        lastModified: new Date(p.updated_at),
        priority: 0.7,
      }),
    );
    return [...staticUrls, ...productUrls];
  } catch {
    return staticUrls;
  }
}
