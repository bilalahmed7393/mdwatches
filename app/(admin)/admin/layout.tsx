import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth";
import { CurrencyProvider } from "@/lib/currency";
import { getSiteSettings } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireAdmin();
  let currency = "USD";
  try {
    const settings = await getSiteSettings();
    if (settings["currency.code"]) currency = settings["currency.code"];
  } catch {}

  return (
    <CurrencyProvider code={currency}>
      <div className="flex min-h-screen flex-col md:flex-row">
        <AdminSidebar role={ctx.profile.role} email={ctx.email ?? ""} />
        <main className="flex-1 overflow-x-hidden bg-secondary/20 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </CurrencyProvider>
  );
}
