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
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    user_agent: request.headers.get("user-agent") ?? null,
    // Trust the typical Vercel/proxy header chain for the originating IP
    ip_address:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null,
  });

  if (error) {
    return NextResponse.json({ error: "Could not submit message" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
