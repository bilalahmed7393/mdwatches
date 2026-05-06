import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { offerInputSchema } from "@/lib/schemas/order";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = offerInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", parsed.data.product_id)
    .maybeSingle();
  if (!product || (product as { status: string }).status === "sold") {
    return NextResponse.json({ error: "Product unavailable" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("offers")
    .insert({
      product_id: parsed.data.product_id,
      customer_name: parsed.data.customer_name,
      customer_email: parsed.data.customer_email,
      customer_phone: parsed.data.customer_phone,
      offered_price: parsed.data.offered_price,
      message: parsed.data.message ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not save offer" }, { status: 500 });
  }
  return NextResponse.json({ id: (data as { id: string }).id });
}
