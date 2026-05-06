import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CurrencyProvider } from "@/lib/currency";
import { getSiteSettings } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let currency = "USD";
  try {
    const settings = await getSiteSettings();
    if (settings["currency.code"]) currency = settings["currency.code"];
  } catch {}

  return (
    <CurrencyProvider code={currency}>
      <AnnouncementBar />
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </CurrencyProvider>
  );
}
