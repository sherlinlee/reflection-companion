import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("observations")
    .select("id, observation_text")
    .limit(3);
  return NextResponse.json({
    userId: user?.id ?? null,
    data,
    error,
  });
}
