import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";

import { createChild } from "@/app/actions/children";
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
        <section className={cardClass}>
          <h2 className={`${sectionLabelClass} mb-4`}>Add individual</h2>
          <form action={createChild} className="flex flex-col gap-3">
            <input
              name="name"
              required
              placeholder="Name"
              className={fieldClass}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="age"
                type="number"
                min={0}
                max={12}
                placeholder="Age (optional)"
                className={fieldClass}
              />
              <input
                name="class_name"
                placeholder="Class (optional)"
                className={fieldClass}
              />
            </div>
            <Button type="submit" variant="cta" className="w-full sm:w-auto" size="lg">
              <Plus />
              Add individual
            </Button>
          </form>
        </section>

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
                <li key={child.id} className="border-b border-[rgba(168,213,207,0.45)] last:border-0">
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