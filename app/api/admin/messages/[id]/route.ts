import { z } from "zod";
import { adminHandler } from "@/lib/api/admin-handler";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["unread", "read", "replied"]).optional(),
  admin_notes: z.string().max(2000).nullable().optional(),
});

export const PATCH = adminHandler(
  { schema: updateSchema },
  async ({ body, supabase, params }) => {
    const update: Record<string, unknown> = {};
    if (body.status !== undefined) update.status = body.status;
    if (body.admin_notes !== undefined) update.admin_notes = body.admin_notes;
    if (body.status === "replied") update.replied_at = new Date().toISOString();

    const { error } = await supabase
      .from("contact_messages")
      .update(update)
      .eq("id", params.id);
    if (error) throw error;
    return { ok: true };
  },
);

export const DELETE = adminHandler({}, async ({ supabase, params }) => {
  const { error } = await supabase.from("contact_messages").delete().eq("id", params.id);
  if (error) throw error;
  return { ok: true };
});
