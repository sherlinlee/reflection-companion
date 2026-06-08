import { redirect } from "next/navigation";

import { AddIndividualForm } from "@/components/add-individual-form";
import { AppHeader } from "@/components/app-header";
import { GroupObservationForm } from "@/components/group-observation-form";
import { MomentumStrip } from "@/components/momentum-strip";
import { PageShell } from "@/components/page-shell";
import { StudentList } from "@/components/student-list";
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
  const childIds = list.map((c) => c.id);

  let countMap: Record<string, number> = {};
  let lastObsMap: Record<string, string> = {};
  let weekObs: { created_at: string }[] = [];

  if (childIds.length > 0) {
    const { data: obsCounts, error: obsCountsError } = await supabase
      .from("observations")
      .select("child_id")
      .in("child_id", childIds);

    if (obsCountsError) {
      console.error(
        "[children/page] observation counts failed:",
        obsCountsError.message,
      );
    }

    countMap = childIds.reduce(
      (acc, id) => {
        acc[id] = 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    for (const row of obsCounts ?? []) {
      countMap[row.child_id] = (countMap[row.child_id] ?? 0) + 1;
    }

    const lastObsResult = await supabase
      .from("observations")
      .select("child_id, created_at")
      .in("child_id", childIds)
      .order("created_at", { ascending: false });

    if (lastObsResult.error) {
      console.error(
        "[children/page] last observations failed:",
        lastObsResult.error.message,
      );
    }

    lastObsMap = (lastObsResult.data ?? []).reduce(
      (acc, o) => {
        if (!acc[o.child_id]) acc[o.child_id] = o.created_at;
        return acc;
      },
      {} as Record<string, string>,
    );

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);

    const { data: weekData, error: weekObsError } = await supabase
      .from("observations")
      .select("created_at")
      .in("child_id", childIds)
      .gte("created_at", weekAgo.toISOString());

    if (weekObsError) {
      console.error(
        "[children/page] week observations failed:",
        weekObsError.message,
      );
    }

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

        {list.length >= 2 && <GroupObservationForm students={list} />}

        {list.length > 0 && <MomentumStrip observations={weekObs} />}

        <StudentList
          students={list}
          countMap={countMap}
          lastObsMap={lastObsMap}
        />
      </PageShell>
    </>
  );
}
