"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getSingleObservationMediaFiles,
  prepareAudioForUpload,
  prepareImageForUpload,
} from "@/lib/observation-media";
import {
  cleanupUploadedPaths,
  removeObservationMediaPaths,
  uploadObservationMedia,
} from "@/lib/observation-media-storage";
import { createClient } from "@/lib/supabase/server";

function newObservationUrl(childId: string, error?: string) {
  const base = `/children/${childId}/observations/new`;
  return error ? `${base}?error=${error}` : base;
}

export async function createObservation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const primaryChildId = String(formData.get("child_id") ?? "");
  const observation_text = String(formData.get("observation_text") ?? "").trim();

  if (!primaryChildId || !observation_text) {
    redirect(newObservationUrl(primaryChildId));
  }

  const additionalChildIds = formData.getAll("additional_child_ids").map(String);
  const allChildIds = Array.from(new Set([primaryChildId, ...additionalChildIds]));

  const { image, audio, error: capError } =
    getSingleObservationMediaFiles(formData);
  if (capError) redirect(newObservationUrl(primaryChildId, capError));

  const uploadedPaths: string[] = [];
  let image_url: string | null = null;
  let audio_url: string | null = null;

  if (image) {
    const prepared = await prepareImageForUpload(image);
    if ("error" in prepared) {
      redirect(newObservationUrl(primaryChildId, prepared.error));
    }
    const path = await uploadObservationMedia(
      supabase,
      user.id,
      "images",
      prepared.data,
    );
    if (!path) redirect(newObservationUrl(primaryChildId, "image_upload"));
    uploadedPaths.push(path);
    image_url = path;
  }

  if (audio) {
    const prepared = await prepareAudioForUpload(audio);
    if ("error" in prepared) {
      await cleanupUploadedPaths(supabase, uploadedPaths);
      redirect(newObservationUrl(primaryChildId, prepared.error));
    }
    const path = await uploadObservationMedia(
      supabase,
      user.id,
      "audio",
      prepared.data,
    );
    if (!path) {
      await cleanupUploadedPaths(supabase, uploadedPaths);
      redirect(newObservationUrl(primaryChildId, "audio_upload"));
    }
    uploadedPaths.push(path);
    audio_url = path;
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
    await cleanupUploadedPaths(supabase, uploadedPaths);
    redirect(newObservationUrl(primaryChildId));
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
