import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { orderInputSchema } from "@/lib/schemas/order";
import { generateOrderNumber } from "@/lib/utils/format";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = orderInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const supabase = createAdminClient();

  // Look up product to compute final_price and verify availability.
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, price, offer_price, status, stock_quantity")
    .eq("id", parsed.data.product_id)
    .maybeSingle();

  if (productError) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const p = product as {
    id: string;
    price: number;
    offer_price: number | null;
    status: string;
    stock_quantity: number;
  };
  if (p.status !== "active" || p.stock_quantity <= 0) {
    return NextResponse.json({ error: "Product unavailable" }, { status: 409 });
  }

  const final_price =
    typeof parsed.data.offered_price === "number"
      ? parsed.data.offered_price
      : (p.offer_price ?? p.price);

  const order_number = generateOrderNumber();

  const { data: inserted, error: insertError } = await supabase
    .from("orders")
    .insert({
      order_number,
      product_id: parsed.data.product_id,
      customer_name: parsed.data.customer_name,
      customer_email: parsed.data.customer_email,
      customer_phone: parsed.data.customer_phone,
      delivery_address: parsed.data.delivery_address,
      offered_price: parsed.data.offered_price ?? null,
      final_price,
      status: "pending",
      admin_notes: parsed.data.notes ?? null,
    })
    .select("id, order_number")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  return NextResponse.json({
    id: (inserted as { id: string }).id,
    order_number: (inserted as { order_number: string }).order_number,
  });
}
