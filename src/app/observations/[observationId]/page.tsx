import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ActionLink } from "@/components/action-link";
import { AppHeader } from "@/components/app-header";
import { getSignedUrl } from "@/lib/get-signed-url";
import { ObservationSettings } from "@/components/observation-settings";
import { PageShell } from "@/components/page-shell";
import { ReflectionCompanion } from "@/components/reflection-companion";
import { createClient } from "@/lib/supabase/server";
import type { Child, Observation, Reflection } from "@/lib/types";
import { navLinkClass } from "@/lib/ui-classes";

export default async function ObservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ observationId: string }>;
  searchParams: Promise<{ child?: string }>;
}) {
  const { observationId } = await params;
  const { child: childFallback } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: obs, error: obsError } = await supabase
    .from("observations")
    .select("id, child_id, observation_text, image_url, audio_url, observed_at")
    .eq("id", observationId)
    .maybeSingle();

  if (obsError) {
    console.error(
      "[observation page] observations query failed:",
      JSON.stringify(obsError),
      "user:",
      user.id,
    );
  }

  if (!obs) {
    if (childFallback) redirect(`/children/${childFallback}`);
    notFound();
  }

  const row = obs as Observation;

  const { data: child, error: childError } = await supabase
    .from("children")
    .select("id, name, class_name")
    .eq("id", row.child_id)
    .maybeSingle();

  if (childError) {
    console.error(
      "[observation page] child query failed:",
      JSON.stringify(childError),
      "user:",
      user.id,
      "child_id:",
      row.child_id,
    );
  }

  const c: Pick<Child, "id" | "name" | "class_name"> = child ?? {
    id: row.child_id,
    name: "Student",
    class_name: null,
  };

  const { data: reflectionRows } = await supabase
    .from("reflections")
    .select("id, patterns, questions, connections, created_at")
    .eq("observation_id", observationId)
    .order("created_at", { ascending: false })
    .limit(1);

  const latest = reflectionRows?.[0];

  const reflection: Reflection | null = latest
    ? {
        id: latest.id,
        observation_id: observationId,
        patterns: latest.patterns as string[],
        questions: latest.questions as string[],
        connections: latest.connections as string[],
        created_at: latest.created_at,
      }
    : null;

  const imageSignedUrl = row.image_url
    ? await getSignedUrl(row.image_url)
    : null;
  const audioSignedUrl = row.audio_url
    ? await getSignedUrl(row.audio_url)
    : null;

  return (
    <>
      <AppHeader
        title="Reflection companion"
        subtitle={`Revisiting documentation for ${c.name}`}
      />
      <PageShell>
        <ActionLink
          href={`/children/${row.child_id}`}
          className={`${navLinkClass} print:hidden`}
        >
          <ArrowLeft className="size-4" />
          Back to {c.name}
        </ActionLink>

        <ObservationSettings
          observationId={observationId}
          childId={row.child_id}
          childName={c.name}
          observationText={row.observation_text}
          observedAt={row.observed_at}
          imageUrl={imageSignedUrl}
          audioUrl={audioSignedUrl}
        />

        <ReflectionCompanion
          observationId={observationId}
          initialReflection={reflection}
          observationText={row.observation_text}
          childName={c.name}
          observedAt={row.observed_at}
        />
      </PageShell>
    </>
  );
}
