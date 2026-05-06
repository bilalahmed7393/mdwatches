import { getSiteSettings } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About",
  description: "About MD Watches.",
};

export default async function AboutPage() {
  let settings: Record<string, string> = {};
  try {
    settings = await getSiteSettings();
  } catch {}
  const body =
    settings["about.body"] ??
    "MD Watches curates pre-loved timepieces with stories worth telling.";
  return (
    <div className="container-narrow py-16">
      <h1 className="font-display text-5xl tracking-tight">About</h1>
      <div className="mt-8 space-y-6 whitespace-pre-line text-lg leading-relaxed text-foreground/90">
        {body}
      </div>
    </div>
  );
}
