"use server";

import { redirect } from "next/navigation";

import { acceptCollaboratorInvites } from "@/lib/accept-collaborator-invites";
import { getRequestAppUrl } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await acceptCollaboratorInvites(supabase, user.email, user.id);
  }

  redirect("/children");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const appUrl = await getRequestAppUrl();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  redirect("/children");
}

export async function requestPasswordReset(
  formData: FormData,
): Promise<{ error?: string; ok?: true; message?: string }> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Enter your email address." };
  }

  const appUrl = await getRequestAppUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    ok: true,
    message: "Check your email for a password reset link.",
  };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  redirect("/children");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
