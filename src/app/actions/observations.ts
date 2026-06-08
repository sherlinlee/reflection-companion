"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { removeObservationMediaPaths } from "@/lib/observation-media-storage";
import { createClient } from "@/lib/supabase/server";

export type CreateObservationResult = {
  error?: string;
};

function parseMediaPath(
  value: FormDataEntryValue | null,
  userId: string,
  folder: "images" | "audio",
): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const prefix = `${userId}/${folder}/`;
  if (!raw.startsWith(prefix)) return null;
  return raw;
}

export async function createObservation(
  formData: FormData,
): Promise<CreateObservationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const primaryChildId = String(formData.get("child_id") ?? "");
  const observation_text = String(formData.get("observation_text") ?? "").trim();

  if (!primaryChildId || !observation_text) {
    return { error: "save_failed" };
  }

  const additionalChildIds = formData.getAll("additional_child_ids").map(String);
  const allChildIds = Array.from(new Set([primaryChildId, ...additionalChildIds]));

  const imageRaw = String(formData.get("image_url") ?? "").trim();
  const audioRaw = String(formData.get("audio_url") ?? "").trim();
  const image_url = parseMediaPath(formData.get("image_url"), user.id, "images");
  const audio_url = parseMediaPath(formData.get("audio_url"), user.id, "audio");

  if ((imageRaw && !image_url) || (audioRaw && !audio_url)) {
    return { error: "invalid_media" };
  }

  const inserts = allChildIds.map((child_id) => ({
    child_id,
    observation_text,
    image_url,
    audio_url,
  }));

  const { data, error } = await supabase
    .from("observations")
    .insert(inserts)
    .select("id, child_id");

  if (error || !data || data.length === 0) {
    return { error: "save_failed" };
  }

  for (const childId of allChildIds) {
    revalidatePath(`/children/${childId}`);
  }

  const primaryObs = data.find((d) => d.child_id === primaryChildId) ?? data[0];
  redirect(`/observations/${primaryObs.id}`);
}

export async function createGroupObservation(formData: FormData) {
  const supabase = await createClient();

  const observation_text = String(formData.get("observation_text") ?? "").trim();
  const childIds = formData.getAll("child_ids").map(String).filter(Boolean);

  if (!observation_text || childIds.length === 0) {
    redirect("/children");
  }

  const inserts = childIds.map((child_id) => ({ child_id, observation_text }));

  const { data, error } = await supabase
    .from("observations")
    .insert(inserts)
    .select("id, child_id");

  if (error || !data || data.length === 0) {
    redirect("/children");
  }

  for (const childId of childIds) {
    revalidatePath(`/children/${childId}`);
  }

  redirect(`/observations/${data[0].id}`);
}

export async function updateObservation(formData: FormData) {
  const supabase = await createClient();
  const observationId = String(formData.get("observation_id") ?? "");
  const childId = String(formData.get("child_id") ?? "");
  const observation_text = String(formData.get("observation_text") ?? "").trim();

  if (!observationId || !observation_text) {
    redirect(`/observations/${observationId}`);
  }

  await supabase.from("reflections").delete().eq("observation_id", observationId);
  await supabase.from("child_reflections").delete().eq("child_id", childId);

  const { error } = await supabase
    .from("observations")
    .update({ observation_text })
    .eq("id", observationId);

  if (error) redirect(`/observations/${observationId}`);

  revalidatePath(`/observations/${observationId}`);
  revalidatePath(`/children/${childId}`);
  redirect(`/observations/${observationId}`);
}

export async function deleteObservation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const observationId = String(formData.get("observation_id") ?? "");
  const childId = String(formData.get("child_id") ?? "");

  if (!observationId) redirect("/children");

  const { data: obs } = await supabase
    .from("observations")
    .select("image_url, audio_url")
    .eq("id", observationId)
    .single();

  await supabase.from("child_reflections").delete().eq("child_id", childId);
  await supabase.from("observations").delete().eq("id", observationId);

  const paths = [obs?.image_url, obs?.audio_url].filter(Boolean) as string[];
  if (user && paths.length > 0) {
    await removeObservationMediaPaths(supabase, user.id, paths);
  }

  revalidatePath(`/children/${childId}`);
  redirect(`/children/${childId}`);
}
