import { NextResponse } from "next/server";
import { z, ZodTypeAny } from "zod";
import { getAdminContext } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;
type AdminCtx = NonNullable<Awaited<ReturnType<typeof getAdminContext>>>;

interface HandlerOpts<S extends ZodTypeAny> {
  schema?: S;
  ownerOnly?: boolean;
}

export function adminHandler<S extends ZodTypeAny>(
  opts: HandlerOpts<S>,
  fn: (ctx: {
    body: z.infer<S>;
    supabase: AdminClient;
    admin: AdminCtx;
    request: Request;
    params: Record<string, string>;
  }) => Promise<unknown>,
) {
  return async (
    request: Request,
    routeCtx: { params?: Promise<Record<string, string>> } = {},
  ) => {
    const params = (await routeCtx.params) ?? {};
    const admin = await getAdminContext();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (opts.ownerOnly && admin.profile.role !== "owner") {
      return NextResponse.json({ error: "Owner only" }, { status: 403 });
    }

    let body: unknown = null;
    if (opts.schema && request.method !== "GET" && request.method !== "DELETE") {
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
      }
      const parsed = opts.schema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 422 },
        );
      }
      body = parsed.data;
    }

    try {
      const data = await fn({
        body: body as z.infer<S>,
        supabase: createAdminClient(),
        admin,
        request,
        params,
      });
      if (data instanceof NextResponse) return data;
      return NextResponse.json(data ?? { ok: true });
    } catch (e) {
      console.error("[adminHandler]", e);
      const message = e instanceof Error ? e.message : "Server error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
