import { adminHandler } from "@/lib/api/admin-handler";
import { promoCodeInputSchema } from "@/lib/schemas/product";

export const dynamic = "force-dynamic";

export const POST = adminHandler({ schema: promoCodeInputSchema }, async ({ body, supabase }) => {
  const { data, error } = await supabase
    .from("promo_codes")
    .insert({ ...body, code: body.code.toUpperCase() })
    .select("id")
    .single();
  if (error) throw error;
  return data;
});
