"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  TicketPercent,
  BarChart3,
  Mail,
  Settings,
  Users,
  Bell,
  UserCog,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/offers", label: "Offers", icon: Mail },
  { href: "/admin/collections", label: "Collections", icon: Tag },
  { href: "/admin/promo-codes", label: "Promo codes", icon: TicketPercent },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/waitlist", label: "Waitlist", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/account", label: "My account", icon: UserCog },
];

export function AdminSidebar({ role, email }: { role: "owner" | "staff"; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items =
    role === "owner" ? [...NAV, { href: "/admin/users", label: "Users", icon: Users }] : NAV;

  // Lock body scroll when drawer is open (DOM side-effect, not React state)
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const navContent = (
    <>
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="font-display text-lg tracking-[0.12em]"
          >
            MD WATCHES
          </Link>
          <p className="text-xs text-muted-foreground">Admin · {role}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-foreground text-background" : "hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="space-y-2 p-3">
        <p className="truncate text-xs text-muted-foreground" title={email}>
          {email}
        </p>
        <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
          <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open admin menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link
          href="/admin/dashboard"
          className="font-display text-base tracking-[0.12em]"
        >
          MD WATCHES
        </Link>
        <span className="ml-auto text-xs text-muted-foreground">{role}</span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-background shadow-xl">
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-background md:flex md:flex-col">
        {navContent}
      </aside>
    </>
  );
}
