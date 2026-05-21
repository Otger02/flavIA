import type { MetadataRoute } from "next";

const BASE_URL = "https://flavia.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin",
          "/admin/*",
          "/api",
          "/api/*",
          "/account",
          "/account/*",
          "/perfil",
          "/perfil/*",
          "/chat",
          "/dashboard",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
