/** @type {import('next').NextConfig} */
const supabaseHostname = (() => {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
    }
  } catch {}
  return "supabase.co";
})();

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: supabaseHostname },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
