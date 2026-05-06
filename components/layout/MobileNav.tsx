"use client";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu } from "lucide-react";
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
      <SheetContent side="left" className="w-80 overflow-y-auto p-0">
        <SheetHeader className="border-b px-6 py-5">
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

        <nav aria-label="Mobile" className="flex flex-col px-3 py-4">
          <Section title="Shop" href="/shop" onNavigate={close} defaultOpen>
            {brands.length > 0 && (
              <SubSection title="By Brand">
                {brands.map((b) => (
                  <SubLink
                    key={b}
                    href={`/shop?brand=${encodeURIComponent(b)}`}
                    onNavigate={close}
                  >
                    {b}
                  </SubLink>
                ))}
              </SubSection>
            )}
            <SubSection title="By Category">
              {categories.map((c) => (
                <SubLink
                  key={c}
                  href={`/shop?category=${encodeURIComponent(c)}`}
                  onNavigate={close}
                >
                  {c}
                </SubLink>
              ))}
            </SubSection>
            <SubSection title="Highlights">
              <SubLink href="/shop?sort=newest" onNavigate={close}>New arrivals</SubLink>
              <SubLink href="/shop?sort=most_viewed" onNavigate={close}>Trending</SubLink>
              <SubLink href="/shop?status=sold" onNavigate={close}>Sold archive</SubLink>
            </SubSection>
          </Section>

          {collections.length > 0 && (
            <Section title="Collections" href="/collections" onNavigate={close}>
              {collections.map((c) => (
                <SubLink
                  key={c.slug}
                  href={`/shop?collection=${c.slug}`}
                  onNavigate={close}
                >
                  {c.name}
                </SubLink>
              ))}
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
    <div className="border-b last:border-b-0">
      <div className="flex items-stretch">
        <Link
          href={href}
          onClick={onNavigate}
          className="flex-1 px-3 py-3 text-base font-medium hover:bg-muted/60"
        >
          {title}
        </Link>
        <button
          type="button"
          aria-label={`Expand ${title}`}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="flex w-12 items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
          />
        </button>
      </div>
      {expanded && <div className="pb-3 pl-4 pr-3">{children}</div>}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="mt-2 px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function SubLink({
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
      className="rounded-md px-3 py-1.5 text-sm text-foreground/85 hover:bg-muted/60 hover:text-foreground"
    >
      {children}
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
      className="border-b px-3 py-3 text-base font-medium last:border-b-0 hover:bg-muted/60"
    >
      {children}
    </Link>
  );
}
