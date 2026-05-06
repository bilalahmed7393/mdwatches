import "server-only";
import { createClient as createSupabase } from "@supabase/supabase-js";

// Service-role client for admin route handlers + privileged server actions.
// NEVER import this from a Client Component.
//
// Note: deliberately untyped (no Database generic). Inserts/updates here are
// validated at the API boundary via zod, and supabase-js's strict generic
// inference for Insert payloads doesn't play well with hand-curated types.
// Read-side queries that benefit from typing live in lib/supabase/queries.ts.
export function createAdminClient() {
  return createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
