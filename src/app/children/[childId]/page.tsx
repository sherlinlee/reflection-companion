import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Settings } from "lucide-react";

import { AddObservationButton } from "@/components/add-observation-button";
import { ActionLink } from "@/components/action-link";
import { AppHeader } from "@/components/app-header";
import { ChildPortfolioPrint } from "@/components/child-portfolio-print";
import { ChildReflectionCompanion } from "@/components/child-reflection-companion";
import { ChildSemesterSummary } from "@/components/child-semester-summary";
import { ChildSettings } from "@/components/child-settings";
import { ObservationList } from "@/components/observation-list";
import { PageShell } from "@/components/page-shell";
import { getSignedUrl } from "@/lib/get-signed-url";
import { createClient } from "@/lib/supabase/server";
import type { Child, ChildReflection, ChildSummary, Observation } from "@/lib/types";
import {
  navLinkClass,
  sectionLabelClass,
} from "@/lib/ui-classes";

export default async function ChildPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const supabase = await createClient();

  const { data: child } = await supabase
    .from("children")
    .select("*")
    .eq("id", childId)
    .single();

  if (!child) notFound();
  const c = child as Child;

  const { data: observations } = await supabase
    .from("observations")
    .select("id, observation_text, observed_at, image_url")
    .eq("child_id", childId)
    .order("observed_at", { ascending: false });

  const obsList = (observations ?? []) as Observation[];

  const portfolioObs = await Promise.all(
    [...obsList]
      .sort(
        (a, b) =>
          new Date(a.observed_at).getTime() - new Date(b.observed_at).getTime(),
      )
      .map(async (obs) => ({
        id: obs.id,
        observation_text: obs.observation_text,
        observed_at: obs.observed_at,
        imageSignedUrl: obs.image_url
          ? await getSignedUrl(obs.image_url)
          : null,
      })),
  );

  const { data: childReflectionRows } = await supabase
    .from("child_reflections")
    .select(
      "id, child_id, patterns, questions, connections, observation_count, created_at",
    )
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(1);

  const latestChildReflection = childReflectionRows?.[0] as
    | ChildReflection
    | undefined;

  const childReflection: ChildReflection | null = latestChildReflection
    ? {
        id: latestChildReflection.id,
        child_id: childId,
        patterns: latestChildReflection.patterns,
        questions: latestChildReflection.questions,
        connections: latestChildReflection.connections,
        observation_count: latestChildReflection.observation_count,
        created_at: latestChildReflection.created_at,
      }
    : null;

  const { data: summaryRows } = await supabase
    .from("child_summaries")
    .select("id, child_id, summary_text, observation_count, created_at")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(1);

  const latestSummary = (summaryRows?.[0] as ChildSummary | undefined) ?? null;

  return (
    <>
      <AppHeader
        title={c.name}
        subtitle={
          [c.age != null ? `Age ${c.age}` : null, c.class_name]
            .filter(Boolean)
            .join(" · ") || undefined
        }
      />

      <PageShell>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="print:hidden">
            <h1 className="font-heading text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] text-[#0f1a18]">
              {c.name}
            </h1>
            {(c.age != null || c.class_name) && (
              <p className="mt-0.5 text-[13px] text-[#8a9490]">
                {[c.age != null ? `Age ${c.age}` : null, c.class_name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ChildPortfolioPrint
              child={c}
              observations={portfolioObs}
              childReflection={childReflection}
            />
            <AddObservationButton
              childId={childId}
              className="print:hidden"
            />
          </div>
        </div>

        <ActionLink href="/children" className={`${navLinkClass} print:hidden`}>
          <ArrowLeft className="size-3.5" />
          All children
        </ActionLink>

        <div className="h-px bg-[rgba(154,124,46,0.12)] print:hidden" />

        <section className="flex flex-col gap-3 print:hidden">
          <h2 className={`${sectionLabelClass} flex items-center gap-2`}>
            <FileText className="size-3" />
            Observations
          </h2>
          {obsList.length === 0 ? (
            <p className="rounded-lg border border-[rgba(154,124,46,0.1)] bg-white px-4 py-6 text-center text-[13px] text-[#8a9490]">
              No observations yet. Add one to get started.
            </p>
          ) : (
            <ObservationList observations={obsList} />
          )}
          <p className="text-[11px] text-[#8a9490]">
            Each entry has its own reflection. Use the section below to reflect
            across all entries together.
          </p>
        </section>

        <ChildReflectionCompanion
          childId={childId}
          childName={c.name}
          childAge={c.age}
          childClass={c.class_name}
          observationCount={obsList.length}
          initialReflection={childReflection}
        />

        <ChildSemesterSummary
          childId={childId}
          childName={c.name}
          observationCount={obsList.length}
          initialSummary={latestSummary}
        />

        <details className="group print:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-[11px] text-[#8a9490] transition-colors hover:text-[#9a7c2e] [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-1.5">
              <Settings className="size-3" />
              Manage student profile
            </span>
            <svg
              className="size-3.5 transition-transform group-open:rotate-180"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <div className="mt-3">
            <ChildSettings child={c} />
          </div>
        </details>
      </PageShell>
    </>
  );
}
