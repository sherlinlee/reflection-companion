import { redirect } from "next/navigation";

import { AddIndividualForm } from "@/components/add-individual-form";
import { AppHeader } from "@/components/app-header";
import { MomentumStrip } from "@/components/momentum-strip";
import { PageShell } from "@/components/page-shell";
import { StudentsAndGroupObservation } from "@/components/students-and-group-observation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Child } from "@/lib/types";

export default async function ChildrenPage() {
  if (!hasSupabaseEnv()) redirect("/setup");

  const supabase = await createClient();
  const { data: children } = await supabase
    .from("children")
    .select("*")
    .order("name");

  const list = (children ?? []) as Child[];

  const countMap: Record<string, number> = {};
  const lastObsMap: Record<string, string> = {};
  if (list.length > 0) {
    const { data: allObs } = await supabase
      .from("observations")
      .select("child_id, observed_at")
      .in("child_id", list.map((c) => c.id))
      .order("observed_at", { ascending: false });
    for (const obs of allObs ?? []) {
      countMap[obs.child_id] = (countMap[obs.child_id] ?? 0) + 1;
      if (!lastObsMap[obs.child_id]) lastObsMap[obs.child_id] = obs.observed_at;
    }
  }

  let weekObs: { observed_at: string }[] = [];
  if (list.length > 0) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);

    const { data: weekData } = await supabase
      .from("observations")
      .select("observed_at")
      .in("child_id", list.map((c) => c.id))
      .gte("observed_at", weekAgo.toISOString());

    weekObs = weekData ?? [];
  }

  return (
    <>
      <AppHeader
        title="Students"
        subtitle="The educator remains the thinker. Document, then revisit with fresh eyes."
      />
      <PageShell>
        <AddIndividualForm />

        {list.length > 0 && <MomentumStrip observations={weekObs} />}

        <StudentsAndGroupObservation
          students={list}
          countMap={countMap}
          lastObsMap={lastObsMap}
        />
      </PageShell>
    </>
  );
}
