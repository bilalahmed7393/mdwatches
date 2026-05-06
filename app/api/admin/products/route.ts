import { adminHandler } from "@/lib/api/admin-handler";
import { productInputSchema } from "@/lib/schemas/product";
import { slugify } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const POST = adminHandler({ schema: productInputSchema }, async ({ body, supabase }) => {
  const slug = body.slug?.trim() || slugify(`${body.brand}-${body.name}`);
  const { data, error } = await supabase
    .from("products")
    .insert({ ...body, slug })
    .select("id, slug")
    .single();
  if (error) throw error;
  return data;
});
