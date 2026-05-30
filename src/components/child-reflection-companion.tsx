"use client";

import { Layers, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ReflectionSection } from "@/components/reflection-sections";
import { Button } from "@/components/ui/button";
import type { ChildReflection } from "@/lib/types";
import { sectionLabelClass } from "@/lib/ui-classes";

export function ChildReflectionCompanion({
  childId,
  childName,
  observationCount,
  initialReflection,
}: {
  childId: string;
  childName: string;
  observationCount: number;
  initialReflection: ChildReflection | null;
}) {
  const router = useRouter();
  const [reflection, setReflection] = useState(initialReflection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStale =
    reflection != null && reflection.observation_count < observationCount;

  async function generate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reflect/child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });
      const data = (await res.json()) as ChildReflection & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Could not generate reflection.");
        return;
      }

      setReflection({
        id: data.id,
        child_id: childId,
        patterns: data.patterns,
        questions: data.questions,
        connections: data.connections,
        observation_count: data.observation_count,
        created_at: data.created_at,
      });
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  if (observationCount === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-[rgba(26,122,110,0.1)] bg-[#EAF5F3] p-6 shadow-[0_2px_10px_rgba(26,122,110,0.05)]">
      <div className="space-y-2">
        <h2 className={`${sectionLabelClass} flex items-center gap-2`}>
          <Layers className="size-3.5" />
          Reflection across documentation
        </h2>
        <p className="text-[15px] leading-[1.92] text-[#3D4F4C]">
          Revisit all of {childName}&apos;s observations together (oldest to
          newest)—patterns and questions that connect entry 1, 2, 3…
        </p>
        <p className="text-xs text-[#7A9490]">
          {observationCount} observation{observationCount === 1 ? "" : "s"}{" "}
          will be included.
        </p>
      </div>

      {isStale && (
        <p className="spark-claim-banner mt-4 text-sm">
          You have new or changed observations since this reflection was
          generated. Regenerate to include the full set.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {!reflection && (
          <Button
            type="button"
            variant="cta"
            size="lg"
            disabled={loading}
            onClick={() => void generate()}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles />
                Reflect across all observations
              </>
            )}
          </Button>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {reflection && (
          <>
            <p className="text-xs text-[#7A9490]">
              Based on {reflection.observation_count} documentation{" "}
              {reflection.observation_count === 1 ? "entry" : "entries"} ·{" "}
              {new Date(reflection.created_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <ReflectionSection
              title="Patterns noticed"
              intro="Patterns across the full body of documentation—not one moment in isolation."
              items={reflection.patterns}
            />
            <ReflectionSection
              title="Reflection questions"
              intro="Questions that may connect multiple entries. You may wish to consider…"
              items={reflection.questions}
            />
            <ReflectionSection
              title="Connections worth exploring"
              intro="How documentation over time might relate—offered with curiosity."
              items={reflection.connections}
              variant="highlight"
            />
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => void generate()}
              className="border-[#1A7A6E]/30 text-[#1A7A6E] hover:bg-[#ffffff]"
            >
              {loading ? "Regenerating…" : "Regenerate across all observations"}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
