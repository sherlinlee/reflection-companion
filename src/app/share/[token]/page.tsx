import { notFound } from "next/navigation";

import { ReflectionSection } from "@/components/reflection-sections";
import { createClient } from "@/lib/supabase/server";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: shareRow } = await supabase
    .from("share_tokens")
    .select("observation_id, expires_at")
    .eq("token", token)
    .single();

  if (!shareRow || new Date(shareRow.expires_at) <= new Date()) {
    notFound();
  }

  const { data: observation } = await supabase
    .from("observations")
    .select(
      `
      id,
      observation_text,
      created_at,
      children ( name, class_name ),
      reflections ( patterns, questions, connections, created_at )
    `,
    )
    .eq("id", shareRow.observation_id)
    .single();

  if (!observation) notFound();

  const childRaw = observation.children;
  const child = (Array.isArray(childRaw) ? childRaw[0] : childRaw) as {
    name: string;
    class_name: string | null;
  };
  const reflections = (observation.reflections ?? []) as {
    patterns: string[];
    questions: string[];
    connections: string[];
    created_at: string;
  }[];

  const latestReflection = [...reflections].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];

  return (
    <div className="mx-auto max-w-[680px] px-4 py-10 sm:px-8">
      <header className="mb-8 border-b border-[rgba(154,124,46,0.15)] pb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#8a9490]">
          Documentation reflection
        </p>
        <h1 className="mt-2 font-heading text-[1.5rem] font-semibold text-[#0f1a18]">
          {child.name}
        </h1>
        {child.class_name && (
          <p className="mt-1 text-[13px] text-[#8a9490]">{child.class_name}</p>
        )}
        <time
          dateTime={observation.created_at}
          className="mt-2 block text-[12px] text-[#8a9490]"
        >
          {new Date(observation.created_at).toLocaleDateString(undefined, {
            dateStyle: "long",
          })}
        </time>
      </header>

      <section className="mb-8">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a9490]">
          Observation
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-[1.75] text-[#0f1a18]">
          {observation.observation_text}
        </p>
      </section>

      {latestReflection && (
        <div className="flex flex-col gap-6">
          <ReflectionSection
            title="Patterns noticed"
            intro="Language and ideas present in the documentation."
            items={latestReflection.patterns}
            variant="patterns"
          />
          <ReflectionSection
            title="Reflection questions"
            intro="Questions for the educator to sit with."
            items={latestReflection.questions}
            variant="questions"
          />
          <ReflectionSection
            title="Connections worth exploring"
            intro="Possible directions to revisit."
            items={latestReflection.connections}
            variant="connections"
          />
        </div>
      )}

      <footer className="mt-12 border-t border-[rgba(154,124,46,0.15)] pt-6 text-center">
        <p className="text-[12px] text-[#8a9490]">
          Powered by{" "}
          <a
            href="https://sparkbysher.com"
            className="font-medium text-[#9a7c2e] underline underline-offset-2"
          >
            Spark by Sher
          </a>
        </p>
      </footer>
    </div>
  );
}
