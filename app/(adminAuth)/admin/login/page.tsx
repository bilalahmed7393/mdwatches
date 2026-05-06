import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Admin · Sign in", robots: { index: false } };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-6">
      <div className="w-full max-w-sm rounded-md border bg-background p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="font-display text-3xl tracking-[0.15em]">MD WATCHES</p>
          <p className="mt-2 text-sm text-muted-foreground">Admin sign-in</p>
        </div>
        <LoginForm redirectTo={sp.from ?? "/admin/dashboard"} />
        {sp.error === "not_authorized" && (
          <p className="mt-4 text-center text-xs text-destructive">
            Your account isn't authorized for the admin portal.
          </p>
        )}
      </div>
    </div>
  );
}
