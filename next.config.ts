import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * Deliberately no Content-Security-Policy yet: Next injects inline scripts for
 * hydration and route data, so a useful CSP needs per-request nonces threaded
 * through the proxy, and a wrong one breaks the app silently in production.
 * The headers below need no such coordination.
 */
const securityHeaders = [
  {
    // Certus is HTTPS-only in production; this stops a downgrade on any later
    // visit. Two years with preload is the value the browser preload lists ask
    // for.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Stops a browser second-guessing a declared Content-Type, which is how an
    // uploaded file gets treated as a script.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Nothing in Certus is meant to be framed, and the Midtrans payment page is
    // a full redirect rather than an embed, so denying outright is safe and
    // rules out clickjacking a signed-in session.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Send the full URL within Certus, but only the origin to third parties, so
    // a page path never leaks into an external referrer log.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // The app asks for none of these, so refuse them all rather than leaving
    // the decision to a future dependency.
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
