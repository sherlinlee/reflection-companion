import OpenAI from "openai";
import { NextResponse } from "next/server";

import { parseReggioReflection } from "@/lib/parse-reflection";
import {
  buildReggioUserMessage,
  REGGIO_SYSTEM_PROMPT,
} from "@/lib/reggio-prompt";
import { createClient } from "@/lib/supabase/server";

const MAX_CHARS = 20_000;

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

  let body: { observationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const observationId = body.observationId;
  if (!observationId) {
    return NextResponse.json(
      { error: "Observation id is required." },
      { status: 400 },
    );
  }

  const { data: observation, error: obsError } = await supabase
    .from("observations")
    .select("id, observation_text, child_id, children(name)")
    .eq("id", observationId)
    .single();

  if (obsError || !observation) {
    return NextResponse.json(
      { error: "Observation not found." },
      { status: 404 },
    );
  }

  const text = observation.observation_text.trim();
  if (text.length > MAX_CHARS) {
    return NextResponse.json({ error: "Observation is too long." }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.6,
      messages: [
        { role: "system", content: REGGIO_SYSTEM_PROMPT },
        { role: "user", content: buildReggioUserMessage(text) },
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

    await supabase
      .from("reflections")
      .delete()
      .eq("observation_id", observationId);

    const { data: reflection, error: saveError } = await supabase
      .from("reflections")
      .insert({
        observation_id: observationId,
        patterns: payload.patterns,
        questions: payload.questions,
        connections: payload.connections,
      })
      .select("id, patterns, questions, connections, created_at")
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({
      id: reflection.id,
      patterns: reflection.patterns as string[],
      questions: reflection.questions as string[],
      connections: reflection.connections as string[],
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
