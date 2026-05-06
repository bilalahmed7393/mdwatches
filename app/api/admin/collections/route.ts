import { adminHandler } from "@/lib/api/admin-handler";
import { collectionInputSchema } from "@/lib/schemas/product";

export const dynamic = "force-dynamic";

export const POST = adminHandler({ schema: collectionInputSchema }, async ({ body, supabase }) => {
  const { data, error } = await supabase
    .from("collections")
    .insert(body)
    .select("id")
    .single();
  if (error) throw error;
  return data;
});
