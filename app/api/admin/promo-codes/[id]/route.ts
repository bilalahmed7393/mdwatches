import { adminHandler } from "@/lib/api/admin-handler";
import { promoCodeInputSchema } from "@/lib/schemas/product";

export const dynamic = "force-dynamic";

export const PUT = adminHandler({ schema: promoCodeInputSchema }, async ({ body, supabase, params }) => {
  const { error } = await supabase
    .from("promo_codes")
    .update({ ...body, code: body.code.toUpperCase() })
    .eq("id", params.id);
  if (error) throw error;
  return { ok: true };
});

export const DELETE = adminHandler({}, async ({ supabase, params }) => {
  const { error } = await supabase.from("promo_codes").delete().eq("id", params.id);
  if (error) throw error;
  return { ok: true };
});
