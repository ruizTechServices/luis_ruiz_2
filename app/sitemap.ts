import type { MetadataRoute } from "next";

function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://luis-ruiz.com";

  try {
    return new URL(raw).origin;
  } catch {
    return "https://luis-ruiz.com";
  }
}

const routes = ["", "/projects", "/blog", "/contact", "/login", "/signup"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return routes.map((route) => ({
    url: `${base}${route || "/"}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
