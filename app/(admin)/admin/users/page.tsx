import { UsersManager } from "@/components/admin/UsersManager";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminProfile } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  const ctx = await requireOwner();
  const supabase = createAdminClient();
  const { data: profiles } = await supabase
    .from("admin_profiles")
    .select("*")
    .order("created_at", { ascending: true });

  // Fetch matching auth users to get emails
  const { data: usersList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map<string, string>();
  for (const u of usersList?.users ?? []) {
    if (u.email) emailById.set(u.id, u.email);
  }

  const users = (profiles ?? []).map((p) => ({
    ...(p as AdminProfile),
    email: emailById.get((p as AdminProfile).id) ?? "—",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Admin users</h1>
        <p className="text-sm text-muted-foreground">
          Owner-only. Add, remove, or update other admins. To change your own info use{" "}
          <a href="/admin/account" className="underline">My account</a>.
        </p>
      </div>
      <UsersManager initial={users} currentUserId={ctx.userId} />
    </div>
  );
}
