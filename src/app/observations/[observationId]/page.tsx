import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getSignedUrl } from "@/lib/get-signed-url";
import { AppHeader } from "@/components/app-header";
import { ObservationSettings } from "@/components/observation-settings";
import { PageShell } from "@/components/page-shell";
import { ReflectionCompanion } from "@/components/reflection-companion";
import { createClient } from "@/lib/supabase/server";
import type { Child, Observation, Reflection } from "@/lib/types";
import { navLinkClass } from "@/lib/ui-classes";

type ObservationRow = Observation & {
  children: Pick<Child, "id" | "name" | "class_name">;
  reflections: {
    id: string;
    patterns: string[];
    questions: string[];
    connections: string[];
    created_at: string;
  }[];
  image_url: string | null;
  audio_url: string | null;
};

export default async function ObservationPage({
  params,
}: {
  params: Promise<{ observationId: string }>;
}) {
  const { observationId } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("observations")
    .select(
      `
      id,
      child_id,
      observation_text,
      image_url,
      audio_url,
      created_at,
      children ( id, name, class_name ),
      reflections ( id, patterns, questions, connections, created_at )
    `,
    )
    .eq("id", observationId)
    .single();

  if (!data) notFound();

  const row = data as unknown as ObservationRow;
  const child = row.children;

  const latest = [...(row.reflections ?? [])].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];

  const reflection: Reflection | null = latest
    ? {
        id: latest.id,
        observation_id: observationId,
        patterns: latest.patterns,
        questions: latest.questions,
        connections: latest.connections,
        created_at: latest.created_at,
      }
    : null;

  // Generate signed URLs for media
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
        subtitle={`Revisiting documentation for ${child.name}`}
      />
      <PageShell>
        <Link
          href={`/children/${row.child_id}`}
          className={`${navLinkClass} print:hidden`}
        >
          <ArrowLeft className="size-4" />
          Back to {child.name}
        </Link>

        <ObservationSettings
          observationId={observationId}
          childId={row.child_id}
          childName={child.name}
          observationText={row.observation_text}
          createdAt={row.created_at}
          imageUrl={imageSignedUrl}
          audioUrl={audioSignedUrl}
        />

        <ReflectionCompanion
          observationId={observationId}
          initialReflection={reflection}
          observationText={row.observation_text}
          childName={child.name}
          createdAt={row.created_at}
        />
      </PageShell>
    </>
  );
}