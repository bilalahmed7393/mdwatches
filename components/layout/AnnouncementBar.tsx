import { getSiteSettings } from "@/lib/supabase/queries";

export async function AnnouncementBar() {
  let settings: Record<string, string> = {};
  try {
    settings = await getSiteSettings();
  } catch {
    return null;
  }
  if (settings["announcement.enabled"] !== "true") return null;
  const text = settings["announcement.text"];
  if (!text) return null;
  return (
    <div className="bg-foreground text-background">
      <div className="container-wide py-2 text-center text-xs tracking-wide">{text}</div>
    </div>
  );
}
