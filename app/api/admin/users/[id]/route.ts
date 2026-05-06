import { z } from "zod";
import { adminHandler } from "@/lib/api/admin-handler";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  role: z.enum(["owner", "staff"]).optional(),
  full_name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(72).optional(),
});

export const PATCH = adminHandler(
  { schema: updateSchema, ownerOnly: true },
  async ({ body, supabase, params }) => {
    const profileUpdate: { role?: "owner" | "staff"; full_name?: string } = {};
    if (body.role) profileUpdate.role = body.role;
    if (body.full_name) profileUpdate.full_name = body.full_name;
    if (Object.keys(profileUpdate).length > 0) {
      const { error } = await supabase
        .from("admin_profiles")
        .update(profileUpdate)
        .eq("id", params.id);
      if (error) throw error;
    }

    const authUpdate: { email?: string; password?: string; email_confirm?: boolean } = {};
    if (body.email) {
      authUpdate.email = body.email;
      authUpdate.email_confirm = true;
    }
    if (body.password) authUpdate.password = body.password;
    if (Object.keys(authUpdate).length > 0) {
      const { error } = await supabase.auth.admin.updateUserById(params.id, authUpdate);
      if (error) throw error;
    }

    return { ok: true };
  },
);

export const DELETE = adminHandler(
  { ownerOnly: true },
  async ({ supabase, params, admin }) => {
    if (params.id === admin.userId) {
      throw new Error("You cannot remove your own account.");
    }
    // Delete the auth user; admin_profiles row cascades from the FK.
    const { error } = await supabase.auth.admin.deleteUser(params.id);
    if (error) throw error;
    return { ok: true };
  },
);
