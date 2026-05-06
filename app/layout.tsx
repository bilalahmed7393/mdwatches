import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MD Watches — Pre-Loved Timepieces",
    template: "%s · MD Watches",
  },
  description:
    "Curated pre-loved watches — luxury, vintage, and standout streetwear timepieces. Authenticated and ready to ship.",
  openGraph: {
    title: "MD Watches",
    description: "Curated pre-loved watches.",
    type: "website",
    url: siteUrl,
    siteName: "MD Watches",
  },
  twitter: {
    card: "summary_large_image",
    title: "MD Watches",
    description: "Curated pre-loved watches.",
  },
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/brand/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} font-sans`}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
