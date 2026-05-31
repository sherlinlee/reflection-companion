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
          <div>
            <label htmlFor="observation_text" className="font-heading text-lg font-semibold">
              Observation
            </label>
            <p className="mt-1 text-[12px] leading-[1.6] text-[#8a9490]">
              The quality of your observation shapes the depth of reflection.
              Include what you saw, what they said, and the context — the richer
              the detail, the more meaningful the reflection.
            </p>
          </div>
          <textarea
            id="observation_text"
            name="observation_text"
            required
            rows={12}
            maxLength={20000}
            placeholder={`Write what you saw and heard — in the child's own words where possible.\n\nExample:\n\nAva crouched by the garden bed and picked up a worm. She held it carefully and said: "The worm is building a road underground. He's an engineer like my dad."\n\nShe spent 10 minutes watching it move before asking if worms sleep.`}
            className={`${fieldClass} min-h-[260px] resize-y`}
          />
          <p className="text-[12px] text-[#8a9490]">
            Richer observations lead to richer reflections.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button type="submit" variant="cta" size="lg">
              Save observation
            </Button>
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href={`/children/${childId}`} />}
            >
              Cancel
            </Button>
          </div>
        </form>
      </PageShell>
    </>
  );
}