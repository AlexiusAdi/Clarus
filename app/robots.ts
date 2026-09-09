import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/helper/appUrl";

/**
 * Everything behind sign-in is disallowed. Those routes already redirect to
 * /login for a crawler, so this is not a security control — it stops the
 * redirects being crawled at all, which keeps the indexed surface to the four
 * pages a signed-out visitor can actually read.
 */
export default function robots(): MetadataRoute.Robots {
  const base = appUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/home",
        "/goals",
        "/groups",
        "/upgrade",
        "/onboarding",
        "/start",
      ],
    },
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  };
}
