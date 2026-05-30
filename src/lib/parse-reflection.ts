import type { ReggioReflectionPayload } from "@/lib/types";

export function parseReggioReflection(raw: string): ReggioReflectionPayload | null {
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const strArr = (v: unknown) =>
    Array.isArray(v)
      ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : [];

  const patterns = strArr(parsed.patterns);
  const questions = strArr(parsed.questions);
  const connections = strArr(parsed.connections);

  if (patterns.length < 2 || questions.length < 3 || connections.length < 2) {
    return null;
  }

  return { patterns, questions, connections };
}
