"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

async function uploadFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  folder: string,
): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("observation-media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return null;
  return path;
}

export async function createObservation(formData: FormData) {
  const supabase = await createClient();

  const primaryChildId = String(formData.get("child_id") ?? "");
  const observation_text = String(formData.get("observation_text") ?? "").trim();

  if (!primaryChildId || !observation_text) {
    redirect(`/children/${primaryChildId}/observations/new`);
  }

  const additionalChildIds = formData.getAll("additional_child_ids").map(String);
  const allChildIds = Array.from(new Set([primaryChildId, ...additionalChildIds]));

  // Handle media uploads
  const imageFile = formData.get("image") as File | null;
  const audioFile = formData.get("audio") as File | null;

  let image_url: string | null = null;
  let audio_url: string | null = null;

  if (imageFile && imageFile.size > 0) {
    image_url = await uploadFile(supabase, imageFile, "images");
  }
  if (audioFile && audioFile.size > 0) {
    audio_url = await uploadFile(supabase, audioFile, "audio");
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
    redirect(`/children/${primaryChildId}/observations/new`);
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
  const observationId = String(formData.get("observation_id") ?? "");
  const childId = String(formData.get("child_id") ?? "");

  if (!observationId) redirect("/children");

  // Get media paths before deleting
  const { data: obs } = await supabase
    .from("observations")
    .select("image_url, audio_url")
    .eq("id", observationId)
    .single();

  // Delete media from storage
  const paths = [obs?.image_url, obs?.audio_url].filter(Boolean) as string[];
  if (paths.length > 0) {
    await supabase.storage.from("observation-media").remove(paths);
  }

  await supabase.from("child_reflections").delete().eq("child_id", childId);
  await supabase.from("observations").delete().eq("id", observationId);

  revalidatePath(`/children/${childId}`);
  redirect(`/children/${childId}`);
}