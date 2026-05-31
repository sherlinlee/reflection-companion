import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Plus } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { ChildReflectionCompanion } from "@/components/child-reflection-companion";
import { ChildSettings } from "@/components/child-settings";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { Child, ChildReflection, Observation } from "@/lib/types";
import {
  linkArrowClass,
  linkRowClass,
  listPanelClass,
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
    .select("id, observation_text, created_at")
    .eq("child_id", childId)
    .order("created_at", { ascending: false });

  const obsList = (observations ?? []) as Observation[];

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
        {/* ── Hero: name + primary action ── */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
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
          <Button
            variant="cta"
            size="lg"
            nativeButton={false}
            render={<Link href={`/children/${childId}/observations/new`} />}
          >
            <Plus />
            Add observation
          </Button>
        </div>

        <Link href="/children" className={navLinkClass}>
          <ArrowLeft className="size-3.5" />
          All children
        </Link>

        <div className="h-px bg-[rgba(154,124,46,0.12)]" />

        {/* ── Observations ── */}
        <section className="flex flex-col gap-3">
          <h2 className={`${sectionLabelClass} flex items-center gap-2`}>
            <FileText className="size-3" />
            Observations
          </h2>
          {obsList.length === 0 ? (
            <p className="rounded-lg border border-[rgba(154,124,46,0.1)] bg-white px-4 py-6 text-center text-[13px] text-[#8a9490]">
              No observations yet. Add one to get started.
            </p>
          ) : (
            <ul className={listPanelClass}>
              {obsList.map((obs) => (
                <li
                  key={obs.id}
                  className="border-b border-[rgba(154,124,46,0.08)] last:border-0"
                >
                  <Link href={`/observations/${obs.id}`} className={linkRowClass}>
                    <span className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[13.5px] leading-relaxed text-[#0f1a18]">
                        {obs.observation_text}
                      </p>
                      <time
                        dateTime={obs.created_at}
                        className="mt-1 block text-[11px] text-[#8a9490]"
                      >
                        {new Date(obs.created_at).toLocaleDateString(
                          undefined,
                          { dateStyle: "medium" },
                        )}
                      </time>
                    </span>
                    <span className={linkArrowClass} aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-[#8a9490]">
            Each entry has its own reflection. Use the section below to reflect
            across all entries together.
          </p>
        </section>

        {/* ── Reflection companion ── */}
        <ChildReflectionCompanion
          childId={childId}
          childName={c.name}
          observationCount={obsList.length}
          initialReflection={childReflection}
        />

        {/* ── Child settings — collapsed at bottom ── */}
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-[11px] text-[#8a9490] transition-colors hover:text-[#9a7c2e] [&::-webkit-details-marker]:hidden">
            <span>Individual profile settings</span>
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