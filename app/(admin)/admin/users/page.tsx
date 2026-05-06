import { Badge } from "@/components/ui/badge";
import { InviteUserForm } from "@/components/admin/InviteUserForm";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminProfile } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  await requireOwner();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("admin_profiles")
    .select("*")
    .order("created_at", { ascending: true });
  const users = (data ?? []) as unknown as AdminProfile[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Admin users</h1>
        <p className="text-sm text-muted-foreground">Owner-only.</p>
      </div>

      <div className="rounded-md border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-secondary/40 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Added</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3">{u.full_name ?? "—"}</td>
                <td className="p-3"><Badge variant="outline">{u.role}</Badge></td>
                <td className="p-3 text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InviteUserForm />
    </div>
  );
}
