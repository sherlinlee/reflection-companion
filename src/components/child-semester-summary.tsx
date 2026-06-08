"use client";

import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ChildSummary } from "@/lib/types";
import { pullQuoteClass } from "@/lib/ui-classes";

type Props = {
  childId: string;
  childName: string;
  observationCount: number;
  initialSummary: ChildSummary | null;
};

export function ChildSemesterSummary({
  childId,
  childName,
  observationCount,
  initialSummary,
}: Props) {
  const router = useRouter();
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (observationCount < 5) return null;

  const isStale =
    summary != null && summary.observation_count < observationCount;

  async function generate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });

      const data = (await res.json()) as ChildSummary & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Could not generate summary.");
        return;
      }

      setSummary({
        id: data.id,
        child_id: childId,
        summary_text: data.summary_text,
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

  async function handleCopy() {
    if (!summary) return;
    await navigator.clipboard.writeText(summary.summary_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="flex flex-col gap-3 print:hidden">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a9490]">
        Semester summary
      </h2>
      <p className="text-[13px] leading-[1.6] text-[#6b7a76]">
        A warm, parent-ready narrative drawn from {childName}&apos;s
        documentation — specific, not clinical.
      </p>

      {isStale && (
        <p className="spark-claim-banner text-[13px]">
          New observations have been added. Regenerate to refresh the summary.
        </p>
      )}

      {!summary && (
        <button
          type="button"
          disabled={loading}
          onClick={() => void generate()}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(154,124,46,0.2)] bg-white px-4 py-2 text-[13px] font-medium text-[#9a7c2e] transition-colors hover:bg-[#faf4e6] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="size-3.5" />
              Generate semester summary
            </>
          )}
        </button>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive"
        >
          {error}
        </p>
      )}

      {summary && (
        <div className="flex flex-col gap-3">
          <blockquote className={pullQuoteClass}>{summary.summary_text}</blockquote>
          <p className="text-[11px] text-[#8a9490]">
            Based on {summary.observation_count}{" "}
            {summary.observation_count === 1 ? "observation" : "observations"} ·{" "}
            {new Date(summary.created_at).toLocaleDateString(undefined, {
              dateStyle: "medium",
            })}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-1.5 text-[12px] text-[#9a7c2e] underline underline-offset-2 hover:text-[#7a6324]"
            >
              {copied ? (
                <>
                  <Check className="size-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy summary
                </>
              )}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void generate()}
              className="text-[12px] text-[#c8a85a] underline underline-offset-2 hover:text-[#9a7c2e] disabled:opacity-40"
            >
              {loading ? "Regenerating…" : "Regenerate"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
