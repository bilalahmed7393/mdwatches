import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/icons/InstagramIcon";
import { getSiteSettings } from "@/lib/supabase/queries";
import { buildWhatsappLink } from "@/lib/utils/format";

export async function Footer() {
  let settings: Record<string, string> = {};
  try {
    settings = await getSiteSettings();
  } catch {}
  const tagline = settings["footer.tagline"] ?? "Curated. Authenticated. Worn-in.";
  const igUrl = settings["contact.instagram_url"] ?? "https://instagram.com/mdwatches.co";
  const email = settings["contact.email"];
  const whatsapp = settings["contact.whatsapp"];

  return (
    <footer className="mt-24 border-t bg-secondary/30">
      <div className="container-wide grid grid-cols-1 gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl tracking-[0.15em]">MD WATCHES</div>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{tagline}</p>
          <div className="mt-5 flex items-center gap-4">
            <a
              href={igUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="text-muted-foreground hover:text-foreground"
            >
              <Instagram className="h-5 w-5" />
            </a>
            {whatsapp && (
              <a
                href={buildWhatsappLink(whatsapp, "Hi MD Watches!")}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                className="text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Shop</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/shop">All watches</Link></li>
            <li><Link href="/collections">Collections</Link></li>
            <li><Link href="/shop?status=sold">Sold archive</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">About</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about">Our story</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            {whatsapp && (
              <li>
                <a href={buildWhatsappLink(whatsapp, "Hi MD Watches!")} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container-wide flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} MD Watches. All rights reserved.</span>
          <span>Bank transfer accepted · Worldwide shipping</span>
        </div>
      </div>
    </footer>
  );
}
