import { z } from "zod";
import { adminHandler } from "@/lib/api/admin-handler";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum([
    "pending",
    "payment_submitted",
    "payment_confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ]).optional(),
  tracking_number: z.string().max(120).nullable().optional(),
  admin_notes: z.string().max(2000).nullable().optional(),
  final_price: z.number().nonnegative().optional(),
});

export const PATCH = adminHandler({ schema: updateSchema }, async ({ body, supabase, params }) => {
  const { error } = await supabase.from("orders").update(body).eq("id", params.id);
  if (error) throw error;

  // If marked confirmed/shipped/delivered for a single-stock product, decrement stock once on first confirm.
  if (body.status === "payment_confirmed") {
    const { data: order } = await supabase
      .from("orders")
      .select("product_id")
      .eq("id", params.id)
      .single();
    if (order) {
      const pid = (order as { product_id: string }).product_id;
      const { data: product } = await supabase
        .from("products")
        .select("stock_quantity, status")
        .eq("id", pid)
        .single();
      if (product) {
        const p = product as { stock_quantity: number; status: string };
        const newQty = Math.max(0, p.stock_quantity - 1);
        await supabase
          .from("products")
          .update({
            stock_quantity: newQty,
            status: newQty === 0 ? "sold" : p.status,
          })
          .eq("id", pid);
      }
    }
  }
  return { ok: true };
});
