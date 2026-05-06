import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { waitlistInputSchema } from "@/lib/schemas/order";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = waitlistInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("waitlist").insert({
    product_id: parsed.data.product_id ?? null,
    customer_name: parsed.data.customer_name,
    customer_email: parsed.data.customer_email,
    customer_phone: parsed.data.customer_phone ?? null,
    notification_preference: parsed.data.notification_preference,
    is_general_newsletter: parsed.data.product_id == null,
  });

  if (error) {
    return NextResponse.json({ error: "Could not save waitlist entry" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
