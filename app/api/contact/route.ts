import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { contactInputSchema } from "@/lib/schemas/order";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("analytics_events").insert({
    event_type: "contact_form_submit",
    metadata: parsed.data,
  });

  if (error) {
    return NextResponse.json({ error: "Could not submit message" }, { status: 500 });
  }
  // TODO(owner): wire to Resend or admin email notification.
  return NextResponse.json({ ok: true });
}
