import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/helper/appUrl";
import { LAST_UPDATED } from "@/constants/legal";

/**
 * Only the signed-out pages. Everything else needs a session, so listing it
 * would just advertise redirects.
 *
 * The legal pages carry the revision date they actually print, so a crawler
 * sees them change when the wording changes rather than on every deploy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  const legalUpdated = new Date(LAST_UPDATED);
  const lastModified = Number.isNaN(legalUpdated.getTime())
    ? new Date()
    : legalUpdated;

  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/login`, changeFrequency: "yearly", priority: 0.5 },
    {
      url: `${base}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
