"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Image as ImageIcon,
  LogOut,
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
  { href: "/admin/instagram", label: "Instagram", icon: ImageIcon },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/waitlist", label: "Waitlist", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ role, email }: { role: "owner" | "staff"; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = role === "owner" ? [...NAV, { href: "/admin/users", label: "Users", icon: Users }] : NAV;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-background md:flex md:flex-col">
      <div className="border-b p-4">
        <Link href="/admin/dashboard" className="font-display text-lg tracking-[0.12em]">
          MD WATCHES
        </Link>
        <p className="text-xs text-muted-foreground">Admin · {role}</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
        <p className="truncate text-xs text-muted-foreground" title={email}>{email}</p>
        <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
          <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
