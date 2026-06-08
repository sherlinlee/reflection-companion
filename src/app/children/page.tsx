import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";

import { createGroupObservation } from "@/app/actions/observations";
import { AddIndividualForm } from "@/components/add-individual-form";
import { AppHeader } from "@/components/app-header";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Child } from "@/lib/types";
import {
  avatarClass,
  cardClass,
  fieldClass,
  linkArrowClass,
  linkRowClass,
  listPanelClass,
  sectionLabelClass,
} from "@/lib/ui-classes";

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

        {/* ── Group observation ── */}
        {list.length >= 2 && (
          <section className="spark-panel-highlight">
            <h2 className={`${sectionLabelClass} mb-3`}>Group observation</h2>
            <p className="mb-4 text-[12px] leading-[1.6] text-[#8a9490]">
              Select two or more students, write one observation — each gets
              their own saved entry and reflection.
            </p>
            <form action={createGroupObservation} className="flex flex-col gap-4">

              {/* Student picker */}
              <div className="flex flex-wrap gap-2">
                {list.map((child) => (
                  <label
                    key={child.id}
                    className="group flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(154,124,46,0.2)] bg-white px-3 py-1.5 text-[13px] text-[#3d4f4c] transition-colors has-[:checked]:border-[#9a7c2e] has-[:checked]:bg-[#faf4e6] has-[:checked]:text-[#9a7c2e]"
                  >
                    <input
                      type="checkbox"
                      name="child_ids"
                      value={child.id}
                      className="sr-only"
                    />
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[rgba(154,124,46,0.3)] text-[10px] group-has-[:checked]:border-[#9a7c2e] group-has-[:checked]:bg-[#9a7c2e] group-has-[:checked]:text-white">
                      ✓
                    </span>
                    <span>{child.name}</span>
                    {child.class_name && (
                      <span className="text-[11px] text-[#8a9490]">
                        {child.class_name}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {/* Observation textarea */}
              <textarea
                name="observation_text"
                required
                rows={6}
                maxLength={20000}
                placeholder={`Write what you saw and heard — include context, what each child said or did, and any interactions between them.`}
                className={`${fieldClass} resize-y`}
              />
              <p className="text-[12px] text-[#8a9490]">
                Richer observations lead to richer reflections.
              </p>

              <Button
                type="submit"
                variant="cta"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Plus />
                Save group observation
              </Button>
            </form>
          </section>
        )}

        {/* ── Your students ── */}
        <section>
          <h2 className={`${sectionLabelClass} mb-4 flex items-center gap-2`}>
            <Users className="size-4" />
            Your students
          </h2>
          {list.length === 0 ? (
            <div className={`${cardClass} text-center text-sm text-muted-foreground`}>
              No students yet. Add one above to begin documenting.
            </div>
          ) : (
            <ul className={listPanelClass}>
              {list.map((child) => (
                <li key={child.id} className="border-b border-[rgba(154,124,46,0.08)] last:border-0">
                  <Link href={`/children/${child.id}`} className={linkRowClass}>
                    <span className={avatarClass}>
                      {child.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-[#0F1A18]">
                        {child.name}
                      </span>
                      <span className="block text-xs text-[#7A9490]">
                        {child.class_name
                          ? `${child.class_name}${child.age != null ? ` · Age ${child.age}` : ""}`
                          : child.age != null
                            ? `Age ${child.age}`
                            : "View observations"}
                      </span>
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