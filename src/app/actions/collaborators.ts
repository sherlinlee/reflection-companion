"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function inviteCoEducator(
  email: string,
): Promise<{ ok: true } | { error: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in required." };
  }

  const { error: insertError } = await supabase.from("educator_invites").insert({
    inviter_id: user.id,
    invitee_email: trimmed,
  });

  if (insertError) {
    return { error: "Could not send invite. Try again." };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (serviceKey && supabaseUrl) {
    const admin = createAdminClient(supabaseUrl, serviceKey);
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "https://reflect.sparkbysher.com";

    await admin.auth.admin.inviteUserByEmail(trimmed, {
      redirectTo: `${appUrl}/auth/callback`,
    });
  }

  return { ok: true };
}
