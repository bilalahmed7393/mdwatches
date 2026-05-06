import { adminHandler } from "@/lib/api/admin-handler";
import { collectionInputSchema } from "@/lib/schemas/product";

export const dynamic = "force-dynamic";

export const PUT = adminHandler({ schema: collectionInputSchema }, async ({ body, supabase, params }) => {
  const { error } = await supabase.from("collections").update(body).eq("id", params.id);
  if (error) throw error;
  return { ok: true };
});

export const DELETE = adminHandler({}, async ({ supabase, params }) => {
  const { error } = await supabase.from("collections").delete().eq("id", params.id);
  if (error) throw error;
  return { ok: true };
});
