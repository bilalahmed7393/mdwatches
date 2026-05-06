import { NextResponse } from "next/server";
import { adminHandler } from "@/lib/api/admin-handler";
import { productInputSchema } from "@/lib/schemas/product";

export const dynamic = "force-dynamic";

export const PUT = adminHandler({ schema: productInputSchema }, async ({ body, supabase, params }) => {
  const { error } = await supabase.from("products").update(body).eq("id", params.id);
  if (error) throw error;
  return { ok: true };
});

export const DELETE = adminHandler({}, async ({ supabase, params }) => {
  const { error } = await supabase.from("products").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json(
      { error: "Cannot delete: product may have associated orders." },
      { status: 409 },
    );
  }
  return { ok: true };
});
