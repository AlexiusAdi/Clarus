import type { MetadataRoute } from "next";

/**
 * Served at /manifest.webmanifest, which the proxy matcher excludes so it stays
 * reachable signed out.
 *
 * start_url is /home rather than / because someone installing Certus to their
 * home screen is already a user: the landing page would only bounce them.
 * The 192 and 512 icons are full-bleed square on purpose — a maskable icon is
 * cropped to whatever shape the platform uses, so it must not carry its own
 * rounded corners.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Certus — Personal finance",
    short_name: "Certus",
    description:
      "Track your income, expenses, assets, investments and savings goals in one place.",
    start_url: "/home",
    display: "standalone",
    background_color: "#faf8f2",
    theme_color: "#faf8f2",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
