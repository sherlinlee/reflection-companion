import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";

import { ALLOWED_AUDIO_TYPES, WHISPER_MAX_BYTES } from "@/lib/observation-media";
import { createClient } from "@/lib/supabase/server";

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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const audio = formData.get("audio");
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
  }

  if (audio.size > WHISPER_MAX_BYTES) {
    return NextResponse.json(
      { error: "Audio file is too large for transcription (max 25 MB)." },
      { status: 400 },
    );
  }

  const type = audio.type || "application/octet-stream";
  if (!ALLOWED_AUDIO_TYPES.has(type)) {
    return NextResponse.json({ error: "Unsupported audio format." }, { status: 400 });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const buffer = Buffer.from(await audio.arrayBuffer());
    const file = await toFile(buffer, audio.name, { type: audio.type });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
    });

    const text = transcription.text.trim();
    if (!text) {
      return NextResponse.json(
        { error: "No speech detected in the recording." },
        { status: 400 },
      );
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "Transcription failed. Try again or type your observation." },
      { status: 500 },
    );
  }
}
