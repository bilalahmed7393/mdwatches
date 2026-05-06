import { z } from "zod";
import { adminHandler } from "@/lib/api/admin-handler";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  full_name: z.string().min(1).max(120),
  role: z.enum(["owner", "staff"]).default("staff"),
});

export const POST = adminHandler(
  { schema: createSchema, ownerOnly: true },
  async ({ body, supabase }) => {
    // Create the auth user with a password set directly — no email step.
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });
    if (error || !created.user) throw error ?? new Error("create_failed");

    const { error: profErr } = await supabase
      .from("admin_profiles")
      .insert({ id: created.user.id, role: body.role, full_name: body.full_name });
    if (profErr) {
      // Roll back — remove the auth user we just created
      await supabase.auth.admin.deleteUser(created.user.id);
      throw profErr;
    }
    return { id: created.user.id };
  },
);
