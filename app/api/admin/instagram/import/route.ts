import { z } from "zod";
import { adminHandler } from "@/lib/api/admin-handler";
import { slugify } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

const importSchema = z.object({
  instagram_post_id: z.string().uuid(),
});

export const POST = adminHandler({ schema: importSchema }, async ({ body, supabase }) => {
  const { data: post } = await supabase
    .from("instagram_posts")
    .select("*")
    .eq("id", body.instagram_post_id)
    .single();
  if (!post) throw new Error("Instagram post not found");
  const p = post as {
    id: string;
    caption: string | null;
    media_url: string;
    is_imported: boolean;
  };
  if (p.is_imported) throw new Error("Already imported");

  const caption = p.caption ?? "Imported from Instagram";
  const name = caption.split("\n")[0].slice(0, 120) || "Imported watch";
  const slug = slugify(`${name}-${Date.now().toString(36).slice(-4)}`);

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      slug,
      name,
      brand: "TBD",
      description: caption,
      price: 0,
      condition_grade: "Excellent",
      status: "draft",
      stock_quantity: 1,
    })
    .select("id, slug")
    .single();
  if (error || !product) throw error ?? new Error("insert_failed");
  const created = product as { id: string; slug: string };

  await supabase.from("product_images").insert({
    product_id: created.id,
    image_url: p.media_url,
    is_primary: true,
    display_order: 0,
  });

  await supabase
    .from("instagram_posts")
    .update({ is_imported: true, linked_product_id: created.id })
    .eq("id", p.id);

  return created;
});
