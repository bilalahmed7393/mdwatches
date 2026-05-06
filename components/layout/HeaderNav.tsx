"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Crown, Sparkles, Tag, Watch } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils/cn";

export interface HeaderNavData {
  brands: string[];
  categories: string[];
  collections: { slug: string; name: string }[];
}

export function HeaderNav({ brands, categories, collections }: HeaderNavData) {
  const pathname = usePathname();
  const [value, setValue] = React.useState("");
  const isOpen = value !== "";

  // Close the menu on route change
  const lastPath = React.useRef(pathname);
  React.useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      setValue("");
    }
  }, [pathname]);

  // Toggle a body data-attr so global CSS can blur page content when menu is open
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.dataset.navOpen = isOpen ? "true" : "false";
    return () => {
      document.body.dataset.navOpen = "false";
    };
  }, [isOpen]);

  return (
    <>
      {/* Dim overlay (page content gets blurred via the body[data-nav-open] CSS rule) */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-0 top-16 z-30 bg-foreground/25 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <NavigationMenu
        value={value}
        onValueChange={setValue}
        delayDuration={120}
        className="hidden md:flex"
      >
        <NavigationMenuList className="gap-2">
          <NavigationMenuItem value="shop">
            <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[720px] grid-cols-[1.1fr_1fr_1.1fr] gap-8 p-7 lg:w-[800px]">
                <MenuColumn title="By Brand" viewAllHref="/shop" viewAllLabel="View all">
                  {brands.slice(0, 7).map((b) => (
                    <MenuItem
                      key={b}
                      href={`/shop?brand=${encodeURIComponent(b)}`}
                      icon={<Watch className="h-4 w-4" />}
                    >
                      {b}
                    </MenuItem>
                  ))}
                </MenuColumn>

                <MenuColumn title="By Category" viewAllHref="/shop" viewAllLabel="View all">
                  {categories.map((c) => (
                    <MenuItem
                      key={c}
                      href={`/shop?category=${encodeURIComponent(c)}`}
                      icon={<Crown className="h-4 w-4" />}
                    >
                      {c}
                    </MenuItem>
                  ))}
                </MenuColumn>

                <MenuColumn title="Highlights">
                  <MenuItem
                    href="/shop?sort=newest"
                    icon={<Sparkles className="h-4 w-4" />}
                    description="The latest pieces in the collection"
                  >
                    New arrivals
                  </MenuItem>
                  <MenuItem
                    href="/shop?sort=most_viewed"
                    icon={<Sparkles className="h-4 w-4" />}
                    description="Most-viewed this month"
                  >
                    Trending
                  </MenuItem>
                  <MenuItem
                    href="/shop?status=sold"
                    icon={<Tag className="h-4 w-4" />}
                    description="Recently sold archive"
                  >
                    Sold archive
                  </MenuItem>
                </MenuColumn>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {collections.length > 0 && (
            <NavigationMenuItem value="collections">
              <NavigationMenuTrigger>Collections</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[480px] grid-cols-2 gap-x-6 gap-y-1 p-7">
                  <div className="col-span-2 mb-2 flex items-baseline justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Curated edits
                    </p>
                    <Link
                      href="/collections"
                      className="inline-flex items-center gap-0.5 text-xs text-foreground/70 transition-colors hover:text-foreground"
                    >
                      View all
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                  {collections.slice(0, 8).map((c) => (
                    <MenuItem key={c.slug} href={`/shop?collection=${c.slug}`}>
                      {c.name}
                    </MenuItem>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/about" className={navigationMenuTriggerStyle}>
                About
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/contact" className={navigationMenuTriggerStyle}>
                Contact
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
}

function MenuColumn({
  title,
  viewAllHref,
  viewAllLabel,
  children,
}: {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </p>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-0.5 text-xs text-foreground/70 transition-colors hover:text-foreground"
          >
            {viewAllLabel ?? "View all"}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function MenuItem({
  href,
  icon,
  description,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className={cn(
          "group/item relative flex items-start gap-3 rounded-lg px-2.5 py-2 transition-all duration-150",
          "hover:bg-foreground/[0.04] focus-visible:bg-foreground/[0.04] focus-visible:outline-none",
          "hover:translate-x-0.5",
        )}
      >
        {icon && (
          <span className="mt-0.5 text-muted-foreground transition-colors group-hover/item:text-foreground">
            {icon}
          </span>
        )}
        <span className="flex flex-col">
          <span className="text-sm font-medium leading-tight transition-colors group-hover/item:text-foreground">
            {children}
          </span>
          {description && (
            <span className="mt-0.5 text-xs text-muted-foreground">{description}</span>
          )}
        </span>
      </Link>
    </NavigationMenuLink>
  );
}
