"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ReflectionSection } from "@/components/reflection-sections";
import { Button } from "@/components/ui/button";
import type { Reflection } from "@/lib/types";
import { pullQuoteClass, staggerSectionsClass } from "@/lib/ui-classes";

export function ReflectionCompanion({
  observationId,
  initialReflection,
}: {
  observationId: string;
  initialReflection: Reflection | null;
}) {
  const router = useRouter();
  const [reflection, setReflection] = useState(initialReflection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observationId }),
      });
      const data = (await res.json()) as Reflection & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Could not generate reflection.");
        return;
      }

      setReflection({
        id: data.id,
        observation_id: observationId,
        patterns: data.patterns,
        questions: data.questions,
        connections: data.connections,
        created_at: data.created_at,
      });
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <p className={pullQuoteClass}>
        The educator remains the thinker. This companion offers patterns,
        questions, and connections to revisit—you interpret what they mean for
        each child.
      </p>

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
              <Sparkles className="spark-icon-pulse" />
              Generate reflection
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
        <div className={`${staggerSectionsClass} flex flex-col gap-6`}>
          <ReflectionSection
            title="Patterns noticed"
            intro="Language and ideas present in the documentation—not conclusions about the child's thinking."
            items={reflection.patterns}
          />
          <ReflectionSection
            title="Reflection questions"
            intro="Questions for you to sit with. You may wish to consider…"
            items={reflection.questions}
          />
          <ReflectionSection
            title="Connections worth exploring"
            intro="Possible directions to revisit—offered with curiosity, not certainty."
            items={reflection.connections}
            variant="highlight"
          />
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => void generate()}
          >
            {loading ? "Regenerating…" : "Regenerate reflection"}
          </Button>
        </div>
      )}
    </div>
  );
}
