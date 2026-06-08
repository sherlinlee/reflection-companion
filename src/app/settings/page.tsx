import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { CoEducatorInviteForm } from "@/components/co-educator-invite-form";
import { AppHeader } from "@/components/app-header";
import { PageShell } from "@/components/page-shell";
import { createClient } from "@/lib/supabase/server";
import { cardClass, sectionLabelClass } from "@/lib/ui-classes";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: pendingInvites } = await supabase
    .from("educator_invites")
    .select("invitee_email, created_at, accepted_at")
    .eq("inviter_id", user.id)
    .order("created_at", { ascending: false });

  const { data: collaborators } = await supabase
    .from("educator_collaborators")
    .select("collaborator_id")
    .eq("owner_id", user.id);

  return (
    <>
      <AppHeader
        title="Settings"
        subtitle="Invite a co-educator to document alongside you."
      />
      <PageShell>
        <section className={`${cardClass} flex flex-col gap-4`}>
          <h2 className={`${sectionLabelClass} flex items-center gap-2`}>
            <Users className="size-3.5" />
            Invite co-educator
          </h2>
          <p className="text-[13px] leading-[1.6] text-[#8a9490]">
            A co-educator can view your students and add observations. They
            cannot add new students or delete your data.
          </p>
          <CoEducatorInviteForm />
          {!process.env.SUPABASE_SERVICE_ROLE_KEY && (
            <p className="text-[11px] text-[#8a9490]">
              Invite emails send automatically when{" "}
              <code className="text-[10px]">SUPABASE_SERVICE_ROLE_KEY</code> is
              configured. Until then, pending invites are saved and linked when
              your colleague signs up with that email.
            </p>
          )}
        </section>

        {(pendingInvites?.length ?? 0) > 0 && (
          <section className={`${cardClass} flex flex-col gap-3`}>
            <h3 className={sectionLabelClass}>Pending invites</h3>
            <ul className="flex flex-col gap-2">
              {pendingInvites!.map((invite) => (
                <li
                  key={invite.invitee_email + invite.created_at}
                  className="flex items-center justify-between text-[13px]"
                >
                  <span className="text-[#0f1a18]">{invite.invitee_email}</span>
                  <span className="text-[11px] text-[#8a9490]">
                    {invite.accepted_at ? "Accepted" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(collaborators?.length ?? 0) > 0 && (
          <section className={`${cardClass} flex flex-col gap-2`}>
            <h3 className={sectionLabelClass}>Active co-educators</h3>
            <p className="text-[13px] text-[#8a9490]">
              {collaborators!.length}{" "}
              {collaborators!.length === 1 ? "collaborator" : "collaborators"}{" "}
              with access to your students.
            </p>
          </section>
        )}
      </PageShell>
    </>
  );
}
