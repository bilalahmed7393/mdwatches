import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const eventSchema = z.object({
  event_type: z.string().min(1).max(60),
  product_id: z.string().uuid().optional().nullable(),
  session_id: z.string().max(120).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event" }, { status: 422 });
  }

  const supabase = createAdminClient();
  await supabase.from("analytics_events").insert({
    event_type: parsed.data.event_type,
    product_id: parsed.data.product_id ?? null,
    session_id: parsed.data.session_id ?? null,
    metadata: parsed.data.metadata ?? null,
  });
  return NextResponse.json({ ok: true });
}
