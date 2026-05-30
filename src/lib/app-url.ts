import { headers } from "next/headers";

/** Fallback URL from env (deploy / local). */
export function getAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

/** Prefer the domain the user is actually visiting (e.g. reflect.sparkbysher.com). */
export async function getRequestAppUrl() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  if (host) {
    const hostname = host.split(",")[0]?.trim().split(":")[0];
    if (hostname && hostname !== "localhost") {
      const proto = headersList.get("x-forwarded-proto") ?? "https";
      return `${proto}://${hostname}`;
    }
  }
  return getAppUrl();
}
