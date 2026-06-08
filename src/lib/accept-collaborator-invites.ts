import type { SupabaseClient } from "@supabase/supabase-js";

export async function acceptCollaboratorInvites(
  supabase: SupabaseClient,
  email: string | undefined,
  userId: string,
) {
  if (!email) return;

  const normalized = email.trim().toLowerCase();

  const { data: invites, error: invitesError } = await supabase
    .from("educator_invites")
    .select("id, inviter_id")
    .eq("invitee_email", normalized)
    .is("accepted_at", null);

  if (invitesError) {
    console.error("acceptCollaboratorInvites: load invites failed", invitesError);
    return;
  }

  for (const invite of invites ?? []) {
    const { error: linkError } = await supabase
      .from("educator_collaborators")
      .upsert(
        {
          owner_id: invite.inviter_id,
          collaborator_id: userId,
        },
        { onConflict: "owner_id,collaborator_id" },
      );

    if (linkError) {
      console.error("acceptCollaboratorInvites: link failed", linkError);
      continue;
    }

    const { error: acceptError } = await supabase
      .from("educator_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    if (acceptError) {
      console.error("acceptCollaboratorInvites: mark accepted failed", acceptError);
    }
  }
}
