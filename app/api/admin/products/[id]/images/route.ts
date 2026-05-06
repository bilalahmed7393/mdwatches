import { z } from "zod";
import { adminHandler } from "@/lib/api/admin-handler";

export const dynamic = "force-dynamic";

const imageSchema = z.object({
  image_url: z.string().min(1).max(1000),
  display_order: z.number().int().nonnegative().default(0),
  is_primary: z.boolean().default(false),
});

export const POST = adminHandler({ schema: imageSchema }, async ({ body, supabase, params }) => {
  // Drop existing primary if this one is primary
  if (body.is_primary) {
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", params.id);
  }
  const { data, error } = await supabase
    .from("product_images")
    .insert({ ...body, product_id: params.id })
    .select("*")
    .single();
  if (error) throw error;
  return data;
});

const reorderSchema = z.object({
  order: z.array(z.object({
    id: z.string().uuid(),
    display_order: z.number().int().nonnegative(),
    is_primary: z.boolean().optional(),
  })).min(1),
});

export const PUT = adminHandler({ schema: reorderSchema }, async ({ body, supabase, params }) => {
  for (const row of body.order) {
    await supabase
      .from("product_images")
      .update({
        display_order: row.display_order,
        ...(typeof row.is_primary === "boolean" ? { is_primary: row.is_primary } : {}),
      })
      .eq("id", row.id)
      .eq("product_id", params.id);
  }
  return { ok: true };
});
