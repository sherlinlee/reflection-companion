import Link from "next/link";
import { notFound } from "next/navigation";

import { createObservation } from "@/app/actions/observations";
import { AppHeader } from "@/components/app-header";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { Child } from "@/lib/types";
import { cardClass, fieldClass } from "@/lib/ui-classes";

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

  return (
    <>
      <AppHeader
        title="Add observation"
        subtitle={`Documentation for ${c.name}`}
      />
      <PageShell>
        <form action={createObservation} className={`${cardClass} flex flex-col gap-4`}>
          <input type="hidden" name="child_id" value={childId} />
          <label htmlFor="observation_text" className="font-heading text-lg font-semibold">
            Observation
          </label>
          <textarea
            id="observation_text"
            name="observation_text"
            required
            rows={12}
            maxLength={20000}
            placeholder={`Example:\n\nAva found a worm.\n\nShe said:\n"The worm is building a road underground."`}
            className={`${fieldClass} min-h-[260px] resize-y`}
          />
          <p className="text-sm text-muted-foreground">
            Record what you noticed—in the child&apos;s words when possible.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" variant="cta" size="lg">
              Save observation
            </Button>
            <Button variant="ghost" render={<Link href={`/children/${childId}`} />}>
              Cancel
            </Button>
          </div>
        </form>
      </PageShell>
    </>
  );
}
