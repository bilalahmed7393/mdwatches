import { AccountForm } from "@/components/admin/AccountForm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · My account" };

export default async function AdminAccountPage() {
  const ctx = await requireAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">My account</h1>
        <p className="text-sm text-muted-foreground">
          Update your name, email, or password.
        </p>
      </div>
      <AccountForm
        initialName={ctx.profile.full_name ?? ""}
        initialEmail={ctx.email ?? ""}
        role={ctx.profile.role}
      />
    </div>
  );
}
