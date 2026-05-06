import { z } from "zod";
import { adminHandler } from "@/lib/api/admin-handler";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  role: z.enum(["owner", "staff"]).optional(),
  full_name: z.string().min(1).max(120).optional(),
});

export const PATCH = adminHandler(
  { schema: updateSchema, ownerOnly: true },
  async ({ body, supabase, params }) => {
    const { error } = await supabase.from("admin_profiles").update(body).eq("id", params.id);
    if (error) throw error;
    return { ok: true };
  },
);

export const DELETE = adminHandler(
  { ownerOnly: true },
  async ({ supabase, params }) => {
    // Remove admin profile (RLS cascade deletes auth.users isn't done here — we just remove their portal access).
    const { error } = await supabase.from("admin_profiles").delete().eq("id", params.id);
    if (error) throw error;
    return { ok: true };
  },
);
