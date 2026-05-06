import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { buildWhatsappLink } from "@/lib/utils/format";
import { getSiteSettings } from "@/lib/supabase/queries";

export async function FloatingWhatsApp() {
  let phone = "";
  try {
    const s = await getSiteSettings();
    phone = (s["contact.whatsapp"] ?? "").trim();
  } catch {}

  if (!phone) return null;

  const href = buildWhatsappLink(
    phone,
    "Hi MD Watches! I'd like to know more about a piece in your collection.",
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 print:hidden"
    >
      {/* Soft pulse ring */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-40 animate-ping motion-reduce:hidden"
      />
      {/* Tooltip — fades in on hover, slides from the right */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-full border border-foreground/10 bg-background px-3.5 py-2 text-xs font-medium text-foreground shadow-md opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
      >
        Chat with us on WhatsApp
      </span>
      {/* Button */}
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30 ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        <WhatsAppIcon className="h-7 w-7 text-white drop-shadow-sm" />
        {/* Online dot */}
        <span
          aria-hidden
          className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-[#25D366] bg-emerald-300"
        />
      </span>
    </a>
  );
}
