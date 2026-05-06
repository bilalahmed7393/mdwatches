import Link from "next/link";
import { Search } from "lucide-react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MobileNav links={navLinks} />
          <Link href="/" className="font-display text-xl tracking-[0.15em]">
            MD WATCHES
          </Link>
        </div>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Search">
            <Link href="/shop">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
