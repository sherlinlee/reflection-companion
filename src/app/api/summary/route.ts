import OpenAI from "openai";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const MAX_OBSERVATIONS = 40;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: { childId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const childId = body.childId;
  if (!childId) {
    return NextResponse.json({ error: "Child id is required." }, { status: 400 });
  }

  const { data: child } = await supabase
    .from("children")
    .select("id, name, age, class_name")
    .eq("id", childId)
    .single();

  if (!child) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const { data: observations } = await supabase
    .from("observations")
    .select("observation_text, created_at")
    .eq("child_id", childId)
    .order("created_at", { ascending: true })
    .limit(MAX_OBSERVATIONS);

  const obsList = observations ?? [];
  if (obsList.length < 5) {
    return NextResponse.json(
      { error: "At least 5 observations are needed for a semester summary." },
      { status: 400 },
    );
  }

  const { data: childReflectionRows } = await supabase
    .from("child_reflections")
    .select("patterns, questions, connections")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(1);

  const childReflection = childReflectionRows?.[0];

  const documentation = obsList
    .map((o, i) => {
      const date = new Date(o.created_at).toLocaleDateString("en", {
        dateStyle: "medium",
      });
      return `Entry ${i + 1} (${date}):\n${o.observation_text}`;
    })
    .join("\n\n");

  const reflectionContext = childReflection
    ? `\n\nEducator reflection across documentation:\nPatterns: ${(childReflection.patterns as string[]).join("; ")}\nQuestions: ${(childReflection.questions as string[]).join("; ")}\nConnections: ${(childReflection.connections as string[]).join("; ")}`
    : "";

  const systemPrompt = `You write warm, specific semester summaries for parents based on Reggio-inspired classroom documentation.

Rules:
- Write in third person about the child by name
- Be warm and specific — reference real details from the observations
- Avoid clinical or diagnostic language
- Do not claim to know what the child is "really" thinking
- One cohesive narrative paragraph (4–7 sentences)
- No bullet points, headings, or markdown`;

  const userPrompt = `Child: ${child.name}${child.age != null ? `, age ${child.age}` : ""}${child.class_name ? `, class ${child.class_name}` : ""}

Documentation entries (oldest to newest):

${documentation}${reflectionContext}

Write a parent-ready semester summary paragraph.`;

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const summaryText = completion.choices[0]?.message?.content?.trim();
    if (!summaryText) {
      return NextResponse.json(
        { error: "Could not generate summary." },
        { status: 500 },
      );
    }

    await supabase
      .from("child_summaries")
      .delete()
      .eq("child_id", childId);

    const { data: saved, error: saveError } = await supabase
      .from("child_summaries")
      .insert({
        child_id: childId,
        summary_text: summaryText,
        observation_count: obsList.length,
      })
      .select("id, child_id, summary_text, observation_count, created_at")
      .single();

    if (saveError || !saved) {
      return NextResponse.json(
        { error: "Summary generated but could not be saved." },
        { status: 500 },
      );
    }

    return NextResponse.json(saved);
  } catch {
    return NextResponse.json(
      { error: "Could not generate summary. Try again." },
      { status: 500 },
    );
  }
}
