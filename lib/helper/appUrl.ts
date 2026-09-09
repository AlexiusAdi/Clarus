/**
 * The app's public origin, without a trailing slash.
 *
 * Every caller appends a path (`${appUrl()}/home`), and NEXT_PUBLIC_APP_URL has
 * historically been set with a trailing slash, which produced links like
 * `https://example.com//home`. Normalising here means the env var can be
 * written either way without anyone having to remember.
 */
export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");
}
