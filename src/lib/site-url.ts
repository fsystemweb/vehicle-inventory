/**
 * Resolves the absolute origin the app is currently deployed at, so
 * server-side code (e.g. building Supabase Auth redirect URLs) never has
 * to hardcode a host.
 *
 * Resolution order:
 * 1. `NEXT_PUBLIC_SITE_URL` — set this explicitly in each deployment's
 *    environment (e.g. the production domain in Vercel's project settings).
 * 2. `VERCEL_URL` — automatically provided by Vercel for preview/production
 *    deployments that don't have an explicit `NEXT_PUBLIC_SITE_URL`.
 * 3. `http://localhost:3000` — local development fallback.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}
