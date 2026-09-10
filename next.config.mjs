// Sanitize and ensure valid URLs exist for NextAuth and Next.js prerendering
const getSafeBaseUrl = () => {
  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim() !== "" && process.env.NEXTAUTH_URL.startsWith("http")) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== "" && process.env.NEXT_PUBLIC_APP_URL.startsWith("http")) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

const safeUrl = getSafeBaseUrl();
process.env.NEXTAUTH_URL = safeUrl;
process.env.NEXT_PUBLIC_APP_URL = safeUrl;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    NEXTAUTH_URL: safeUrl,
    NEXT_PUBLIC_APP_URL: safeUrl,
  },
};

export default nextConfig;
