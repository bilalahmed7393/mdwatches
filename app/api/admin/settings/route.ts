import { z } from "zod";
import { adminHandler } from "@/lib/api/admin-handler";

export const dynamic = "force-dynamic";

const settingsSchema = z.object({
  updates: z.array(z.object({
    key: z.string().min(1).max(120),
    value: z.string().nullable(),
    type: z.enum(["text", "image", "json", "boolean"]).optional(),
    section: z.string().max(60).optional(),
  })),
});

export const PUT = adminHandler({ schema: settingsSchema }, async ({ body, supabase }) => {
  for (const row of body.updates) {
    await supabase
      .from("site_settings")
      .upsert(
        {
          key: row.key,
          value: row.value,
          type: row.type ?? "text",
          section: row.section ?? "general",
        },
        { onConflict: "key" },
      );
  }
  return { ok: true };
});
