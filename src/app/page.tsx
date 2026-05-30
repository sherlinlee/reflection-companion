import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";

// Read Supabase env at request time (not from a static build without .env.local)
export const dynamic = "force-dynamic";

export default function Home() {
  if (!hasSupabaseEnv()) redirect("/setup");
  redirect("/children");
}
