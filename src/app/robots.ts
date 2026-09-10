import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== ""
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://mailpilot.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/settings/"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
