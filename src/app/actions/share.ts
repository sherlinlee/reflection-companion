"use server";

import { createClient } from "@/lib/supabase/server";

const DEFAULT_APP_URL = "https://reflect.sparkbysher.com";

export async function createShareToken(
  observationId: string,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in required." };
  }

  const { data, error } = await supabase
    .from("share_tokens")
    .insert({ observation_id: observationId })
    .select("token")
    .single();

  if (error || !data?.token) {
    return { error: "Could not create share link. Try again." };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? DEFAULT_APP_URL;

  return { url: `${baseUrl}/share/${data.token}` };
}
