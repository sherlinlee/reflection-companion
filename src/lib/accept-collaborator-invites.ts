import type { SupabaseClient } from "@supabase/supabase-js";

export async function acceptCollaboratorInvites(
  supabase: SupabaseClient,
  email: string | undefined,
  userId: string,
) {
  if (!email) return;

  const normalized = email.trim().toLowerCase();

  const { data: invites } = await supabase
    .from("educator_invites")
    .select("id, inviter_id")
    .ilike("invitee_email", normalized)
    .is("accepted_at", null);

  for (const invite of invites ?? []) {
    await supabase.from("educator_collaborators").upsert(
      {
        owner_id: invite.inviter_id,
        collaborator_id: userId,
      },
      { onConflict: "owner_id,collaborator_id" },
    );

    await supabase
      .from("educator_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);
  }
}
