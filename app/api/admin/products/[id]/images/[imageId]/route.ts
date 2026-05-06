import { adminHandler } from "@/lib/api/admin-handler";

export const dynamic = "force-dynamic";

export const DELETE = adminHandler({}, async ({ supabase, params }) => {
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", params.imageId)
    .eq("product_id", params.id);
  if (error) throw error;
  return { ok: true };
});
