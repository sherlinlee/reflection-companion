import { redirect } from "next/navigation";

import { AddIndividualForm } from "@/components/add-individual-form";
import { AppHeader } from "@/components/app-header";
import { GroupObservationForm } from "@/components/group-observation-form";
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

  return (
    <>
      <AppHeader
        title="Students"
        subtitle="The educator remains the thinker. Document, then revisit with fresh eyes."
      />
      <PageShell>

        <AddIndividualForm />

        {list.length >= 2 && <GroupObservationForm students={list} />}

        <StudentList students={list} />

      </PageShell>
    </>
  );
}