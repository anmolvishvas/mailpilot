import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== ""
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://mailpilot.vercel.app";
  return [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${appUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
