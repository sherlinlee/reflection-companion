import OpenAI from "openai";
import { NextResponse } from "next/server";

import { parseReggioReflection } from "@/lib/parse-reflection";
import {
  buildReggioChildUserMessage,
  REGGIO_CHILD_SYSTEM_PROMPT,
} from "@/lib/reggio-prompt";
import { createClient } from "@/lib/supabase/server";

const MAX_TOTAL_CHARS = 30_000;

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

  const { data: child, error: childError } = await supabase
    .from("children")
    .select("id, name")
    .eq("id", childId)
    .single();

  if (childError || !child) {
    return NextResponse.json({ error: "Child not found." }, { status: 404 });
  }

  const { data: observations, error: obsError } = await supabase
    .from("observations")
    .select("observation_text, created_at")
    .eq("child_id", childId)
    .order("created_at", { ascending: true });

  if (obsError) {
    return NextResponse.json({ error: obsError.message }, { status: 500 });
  }

  const obsList = observations ?? [];
  if (obsList.length === 0) {
    return NextResponse.json(
      { error: "Add at least one observation before reflecting across documentation." },
      { status: 400 },
    );
  }

  let totalChars = 0;
  const entries: { index: number; date: string; text: string }[] = [];

  for (let i = 0; i < obsList.length; i++) {
    const text = obsList[i].observation_text.trim();
    if (totalChars + text.length > MAX_TOTAL_CHARS) break;
    totalChars += text.length;
    entries.push({
      index: i + 1,
      date: new Date(obsList[i].created_at).toLocaleDateString(undefined, {
        dateStyle: "medium",
      }),
      text,
    });
  }

  if (entries.length === 0) {
    return NextResponse.json(
      { error: "Documentation is too long to reflect on at once." },
      { status: 400 },
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.6,
      messages: [
        { role: "system", content: REGGIO_CHILD_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildReggioChildUserMessage(child.name, entries),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "No response from the model." },
        { status: 502 },
      );
    }

    const payload = parseReggioReflection(raw);
    if (!payload) {
      return NextResponse.json(
        { error: "Unexpected response format." },
        { status: 502 },
      );
    }

    await supabase.from("child_reflections").delete().eq("child_id", childId);

    const { data: reflection, error: saveError } = await supabase
      .from("child_reflections")
      .insert({
        child_id: childId,
        patterns: payload.patterns,
        questions: payload.questions,
        connections: payload.connections,
        observation_count: entries.length,
      })
      .select(
        "id, patterns, questions, connections, observation_count, created_at",
      )
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({
      id: reflection.id,
      child_id: childId,
      patterns: reflection.patterns as string[],
      questions: reflection.questions as string[],
      connections: reflection.connections as string[],
      observation_count: reflection.observation_count,
      created_at: reflection.created_at,
    });
  } catch (err) {
    const message =
      err instanceof OpenAI.APIError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Something went wrong.";
    const status =
      err instanceof OpenAI.APIError && err.status ? err.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
