import "server-only";
import { cache } from "react";
import { getSiteSettings } from "@/lib/supabase/queries";

/** Server-only: reads the configured currency code, memoised per request. */
export const getServerCurrency = cache(async (): Promise<string> => {
  try {
    const s = await getSiteSettings();
    return s["currency.code"] || "USD";
  } catch {
    return "USD";
  }
});
