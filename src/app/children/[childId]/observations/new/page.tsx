import { notFound } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { NewObservationForm } from "@/components/new-observation-form";
import { PageShell } from "@/components/page-shell";
import { createClient } from "@/lib/supabase/server";
import type { Child } from "@/lib/types";

export default async function NewObservationPage({
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

  const { data: allChildren } = await supabase
    .from("children")
    .select("id, name, class_name, age")
    .neq("id", childId)
    .order("name");

  const others = (allChildren ?? []) as Child[];

  return (
    <>
      <AppHeader
        title="Add observation"
        subtitle={`Documentation for ${c.name}`}
      />
      <PageShell>
        <NewObservationForm childId={childId} others={others} />
      </PageShell>
    </>
  );
}
