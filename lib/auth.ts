import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminProfile } from "@/types/database";

export type AdminContext = {
  userId: string;
  email: string | null;
  profile: AdminProfile;
};

/**
 * Use inside server components, server actions, and route handlers under /admin.
 * Redirects to /admin/login if unauthenticated; throws 403 if signed in but not an admin.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // User exists but has no admin row — sign them out and bounce.
    await supabase.auth.signOut();
    redirect("/admin/login?error=not_authorized");
  }

  return { userId: user.id, email: user.email ?? null, profile };
}

export async function requireOwner(): Promise<AdminContext> {
  const ctx = await requireAdmin();
  if (ctx.profile.role !== "owner") {
    redirect("/admin/dashboard?error=owner_only");
  }
  return ctx;
}

/**
 * For API route handlers — returns null instead of redirecting.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return { userId: user.id, email: user.email ?? null, profile };
}
