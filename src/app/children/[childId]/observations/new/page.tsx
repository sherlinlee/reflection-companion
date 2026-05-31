import Link from "next/link";
import { notFound } from "next/navigation";

import { createObservation } from "@/app/actions/observations";
import { AppHeader } from "@/components/app-header";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { Child } from "@/lib/types";
import { cardClass, fieldClass, sectionLabelClass } from "@/lib/ui-classes";

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

  // Fetch all other children for the group picker
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
        <form
          action={createObservation}
          className={`${cardClass} flex flex-col gap-5`}
        >
          <input type="hidden" name="child_id" value={childId} />

          {/* ── Observation text ── */}
          <div>
            <label
              htmlFor="observation_text"
              className="font-heading text-lg font-semibold"
            >
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

          {/* ── Group observation picker ── */}
          {others.length > 0 && (
            <div className="border-t border-[rgba(154,124,46,0.1)] pt-4">
              <p className={`${sectionLabelClass} mb-3`}>
                Also document for
              </p>
              <p className="mb-3 text-[12px] leading-[1.5] text-[#8a9490]">
                This observation will be saved separately for each selected
                student — each gets their own reflection.
              </p>
              <div className="flex flex-wrap gap-2">
                {others.map((other) => (
                  <label
                    key={other.id}
                    className="group flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(154,124,46,0.2)] bg-white px-3 py-1.5 text-[13px] text-[#3d4f4c] transition-colors has-[:checked]:border-[#9a7c2e] has-[:checked]:bg-[#faf4e6] has-[:checked]:text-[#9a7c2e]"
                  >
                    <input
                      type="checkbox"
                      name="additional_child_ids"
                      value={other.id}
                      className="sr-only"
                    />
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[rgba(154,124,46,0.3)] text-[10px] group-has-[:checked]:border-[#9a7c2e] group-has-[:checked]:bg-[#9a7c2e] group-has-[:checked]:text-white">
                      ✓
                    </span>
                    <span>{other.name}</span>
                    {other.class_name && (
                      <span className="text-[11px] text-[#8a9490]">
                        {other.class_name}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Actions ── */}
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