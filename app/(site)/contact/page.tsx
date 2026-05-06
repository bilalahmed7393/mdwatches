import { Mail, MessageCircle } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/icons/InstagramIcon";
import { ContactForm } from "@/components/forms/ContactForm";
import { getSiteSettings } from "@/lib/supabase/queries";
import { buildWhatsappLink } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact",
  description: "Get in touch with MD Watches.",
};

export default async function ContactPage() {
  let settings: Record<string, string> = {};
  try {
    settings = await getSiteSettings();
  } catch {}
  const whatsapp = settings["contact.whatsapp"];
  const email = settings["contact.email"];
  const ig = settings["contact.instagram_url"] ?? "https://instagram.com/mdwatches.co";
  return (
    <div className="container-narrow py-16">
      <h1 className="font-display text-5xl tracking-tight">Contact</h1>
      <p className="mt-2 text-muted-foreground">
        Drop a message — we typically reply within 24 hours.
      </p>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <ContactForm />
        <div className="space-y-4 text-sm">
          <h2 className="font-display text-xl">Other ways to reach us</h2>
          <ul className="space-y-3">
            {whatsapp && (
              <li>
                <a
                  href={buildWhatsappLink(whatsapp, "Hi MD Watches!")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:underline"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp: {whatsapp}
                </a>
              </li>
            )}
            {email && (
              <li>
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 hover:underline">
                  <Mail className="h-4 w-4" /> {email}
                </a>
              </li>
            )}
            <li>
              <a href={ig} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                <Instagram className="h-4 w-4" /> @mdwatches.co
              </a>
            </li>
          </ul>

          {settings["bank.account_name"] && settings["bank.account_name"] !== "TODO: owner input" && (
            <div className="mt-8 rounded-md border bg-secondary/30 p-4">
              <h3 className="font-display text-base">Bank transfer</h3>
              <dl className="mt-2 space-y-1 text-sm">
                <div><dt className="inline text-muted-foreground">Bank: </dt><dd className="inline">{settings["bank.bank_name"]}</dd></div>
                <div><dt className="inline text-muted-foreground">Account: </dt><dd className="inline">{settings["bank.account_name"]}</dd></div>
                <div><dt className="inline text-muted-foreground">No.: </dt><dd className="inline">{settings["bank.account_number"]}</dd></div>
                {settings["bank.swift_code"] && (
                  <div><dt className="inline text-muted-foreground">SWIFT: </dt><dd className="inline">{settings["bank.swift_code"]}</dd></div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
