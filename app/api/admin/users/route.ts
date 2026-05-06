import { z } from "zod";
import { adminHandler } from "@/lib/api/admin-handler";

export const dynamic = "force-dynamic";

const inviteSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1).max(120),
  role: z.enum(["owner", "staff"]).default("staff"),
});

export const POST = adminHandler(
  { schema: inviteSchema, ownerOnly: true },
  async ({ body, supabase }) => {
    // Use Supabase Auth Admin API to invite by email.
    const { data: invited, error } = await supabase.auth.admin.inviteUserByEmail(body.email);
    if (error || !invited.user) throw error ?? new Error("invite_failed");
    await supabase.from("admin_profiles").insert({
      id: invited.user.id,
      role: body.role,
      full_name: body.full_name,
    });
    return { id: invited.user.id };
  },
);
