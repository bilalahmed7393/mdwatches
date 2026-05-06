import { z } from "zod";
import { adminHandler } from "@/lib/api/admin-handler";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected", "countered"]),
  admin_response: z.string().max(2000).nullable().optional(),
});

export const PATCH = adminHandler({ schema: updateSchema }, async ({ body, supabase, params }) => {
  const { error } = await supabase.from("offers").update(body).eq("id", params.id);
  if (error) throw error;
  return { ok: true };
});
