import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const schema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(72).optional(),
});

export async function PATCH(request: Request) {
  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const supabase = createAdminClient();

  if (parsed.data.full_name) {
    const { error } = await supabase
      .from("admin_profiles")
      .update({ full_name: parsed.data.full_name })
      .eq("id", ctx.userId);
    if (error) {
      return NextResponse.json({ error: "Failed to save name" }, { status: 500 });
    }
  }

  const authUpdate: { email?: string; password?: string; email_confirm?: boolean } = {};
  if (parsed.data.email && parsed.data.email !== ctx.email) {
    authUpdate.email = parsed.data.email;
    authUpdate.email_confirm = true;
  }
  if (parsed.data.password) authUpdate.password = parsed.data.password;

  if (Object.keys(authUpdate).length > 0) {
    const { error } = await supabase.auth.admin.updateUserById(ctx.userId, authUpdate);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
