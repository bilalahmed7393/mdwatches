"use client";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ChevronDown,
  Crown,
  Menu,
  Sparkles,
  Tag,
  Watch,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils/cn";
import type { HeaderNavData } from "@/components/layout/HeaderNav";

export function MobileNav({ navData }: { navData: HeaderNavData }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { brands, categories, collections } = navData;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-0">
        <SheetHeader className="border-b bg-background px-6 py-5">
          <SheetTitle className="flex items-center gap-2">
            <Image
              src="/brand/md-watches-mark.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-auto"
            />
            <span className="font-display tracking-[0.2em]">MD WATCHES</span>
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
          <Section title="Shop" href="/shop" onNavigate={close} defaultOpen>
            <div className="space-y-3 px-1 pb-3 pt-2">
              {brands.length > 0 && (
                <SubSection title="By Brand" icon={<Watch className="h-3.5 w-3.5" />}>
                  {brands.slice(0, 8).map((b) => (
                    <Chip
                      key={b}
                      href={`/shop?brand=${encodeURIComponent(b)}`}
                      onNavigate={close}
                    >
                      {b}
                    </Chip>
                  ))}
                </SubSection>
              )}

              <SubSection title="By Category" icon={<Crown className="h-3.5 w-3.5" />}>
                {categories.map((c) => (
                  <Chip
                    key={c}
                    href={`/shop?category=${encodeURIComponent(c)}`}
                    onNavigate={close}
                  >
                    {c}
                  </Chip>
                ))}
              </SubSection>

              <SubSection title="Highlights" icon={<Sparkles className="h-3.5 w-3.5" />}>
                <ListItem
                  href="/shop?sort=newest"
                  onNavigate={close}
                  description="The latest pieces"
                >
                  New arrivals
                </ListItem>
                <ListItem
                  href="/shop?sort=most_viewed"
                  onNavigate={close}
                  description="Most-viewed this month"
                >
                  Trending
                </ListItem>
                <ListItem
                  href="/shop?status=sold"
                  onNavigate={close}
                  description="Recently sold archive"
                  icon={<Tag className="h-3.5 w-3.5" />}
                >
                  Sold archive
                </ListItem>
              </SubSection>
            </div>
          </Section>

          {collections.length > 0 && (
            <Section title="Collections" href="/collections" onNavigate={close}>
              <div className="px-1 pb-3 pt-2">
                <SubSection title="Curated edits">
                  {collections.map((c) => (
                    <Chip
                      key={c.slug}
                      href={`/shop?collection=${c.slug}`}
                      onNavigate={close}
                    >
                      {c.name}
                    </Chip>
                  ))}
                </SubSection>
              </div>
            </Section>
          )}

          <FlatLink href="/about" onNavigate={close}>About</FlatLink>
          <FlatLink href="/contact" onNavigate={close}>Contact</FlatLink>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  href,
  defaultOpen = false,
  onNavigate,
  children,
}: {
  title: string;
  href: string;
  defaultOpen?: boolean;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="flex items-stretch">
        <Link
          href={href}
          onClick={onNavigate}
          className="flex flex-1 items-center gap-2 px-4 py-3.5 text-base font-medium transition-colors hover:bg-muted/40"
        >
          {title}
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
        <button
          type="button"
          aria-label={`Expand ${title}`}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="flex w-12 items-center justify-center border-l text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-180")}
          />
        </button>
      </div>
      {expanded && (
        <div className="border-t bg-muted/20">{children}</div>
      )}
    </div>
  );
}

function SubSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-background/80 p-3 ring-1 ring-foreground/5">
      <div className="mb-2 flex items-center gap-2">
        {icon && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/[0.06] text-foreground/70">
            {icon}
          </span>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/70">
          {title}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="inline-flex items-center rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground/85 transition-colors hover:border-foreground/30 hover:bg-foreground hover:text-background"
    >
      {children}
    </Link>
  );
}

function ListItem({
  href,
  description,
  icon,
  onNavigate,
  children,
}: {
  href: string;
  description?: string;
  icon?: React.ReactNode;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group flex w-full items-start gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-foreground/[0.04]"
    >
      {icon && (
        <span className="mt-0.5 text-muted-foreground transition-colors group-hover:text-foreground">
          {icon}
        </span>
      )}
      <span className="flex flex-col text-left">
        <span className="text-sm font-medium leading-tight">{children}</span>
        {description && (
          <span className="mt-0.5 text-[11px] text-muted-foreground">{description}</span>
        )}
      </span>
    </Link>
  );
}

function FlatLink({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="rounded-xl border bg-background px-4 py-3.5 text-base font-medium transition-colors hover:bg-muted/40"
    >
      {children}
    </Link>
  );
}
