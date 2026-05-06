/** @type {import('next').NextConfig} */
const supabaseUrl = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
      : null;
  } catch {
    return null;
  }
})();

const localPattern = supabaseUrl && supabaseUrl.protocol === "http:"
  ? [{ protocol: "http", hostname: supabaseUrl.hostname, port: supabaseUrl.port || undefined }]
  : [];

const nextConfig = {
  images: {
    remotePatterns: [
      ...localPattern,
      { protocol: "https", hostname: supabaseUrl?.hostname ?? "supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Local Supabase serves images from 127.0.0.1, which Next blocks by default
    // as an SSRF protection. Only relax this in dev — production should never
    // pull images from private IPs.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
