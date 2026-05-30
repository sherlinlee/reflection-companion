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
  cardClass,
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
            .join(" · ") || "Observations"
        }
      />
      <PageShell>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="cta"
            size="lg"
            render={<Link href={`/children/${childId}/observations/new`} />}
          >
            <Plus />
            Add observation
          </Button>
          <Link href="/children" className={navLinkClass}>
            <ArrowLeft className="size-4" />
            All children
          </Link>
        </div>

        <ChildSettings child={c} />

        <ChildReflectionCompanion
          childId={childId}
          childName={c.name}
          observationCount={obsList.length}
          initialReflection={childReflection}
        />

        <section>
          <h2 className={`${sectionLabelClass} mb-2 flex items-center gap-2`}>
            <FileText className="size-4" />
            Observations
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Each entry has its own reflection. Use the section above to reflect
            across all entries together.
          </p>
          {obsList.length === 0 ? (
            <div className={`${cardClass} text-center text-sm text-muted-foreground`}>
              No observations yet. Add one to generate a reflection companion.
            </div>
          ) : (
            <ul className={listPanelClass}>
              {obsList.map((obs) => (
                <li key={obs.id} className="border-b border-[rgba(168,213,207,0.45)] last:border-0">
                  <Link href={`/observations/${obs.id}`} className={linkRowClass}>
                    <span className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm leading-relaxed">
                        {obs.observation_text}
                      </p>
                      <time
                        dateTime={obs.created_at}
                        className="mt-2 block text-xs text-muted-foreground"
                      >
                        {new Date(obs.created_at).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </time>
                    </span>
                    <span className={linkArrowClass}>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </PageShell>
    </>
  );
}
