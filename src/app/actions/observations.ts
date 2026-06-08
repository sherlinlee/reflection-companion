"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { removeObservationMediaPaths } from "@/lib/observation-media-storage";
import { createClient } from "@/lib/supabase/server";

export type CreateObservationInput = {
  child_id: string;
  observation_text: string;
  observed_at?: string;
  image_url?: string;
  audio_url?: string;
  additional_child_ids?: string[];
};

export type CreateObservationResult = {
  error?: string;
  reason?: string;
  observationId?: string;
  childId?: string;
};

function parseMediaPath(
  value: string | null | undefined,
  userId: string,
  folder: "images" | "audio",
): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const prefix = `${userId}/${folder}/`;
  if (!raw.startsWith(prefix)) {
    console.error("createObservation error: media path prefix mismatch", {
      folder,
      expectedPrefix: prefix,
      receivedPrefix: raw.slice(0, prefix.length),
      pathUserId: raw.split("/")[0],
      authUserId: userId,
    });
    return null;
  }
  return raw;
}

function parseObservedAt(raw: string | undefined): string {
  const observed_at_raw = String(raw ?? "").trim();
  return observed_at_raw
    ? new Date(observed_at_raw).toISOString()
    : new Date().toISOString();
}

function buildObservationInsert(
  child_id: string,
  observation_text: string,
  observed_at: string,
  image_url: string | null,
  audio_url: string | null,
  id?: string,
) {
  const row: {
    id?: string;
    child_id: string;
    observation_text: string;
    observed_at: string;
    image_url?: string;
    audio_url?: string;
  } = { child_id, observation_text, observed_at };
  if (id) row.id = id;
  if (image_url) row.image_url = image_url;
  if (audio_url) row.audio_url = audio_url;
  return row;
}

export async function createObservation(
  input: CreateObservationInput,
): Promise<CreateObservationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("createObservation error: not authenticated");
    return { error: "not_authenticated" };
  }

  const primaryChildId = String(input.child_id ?? "").trim();
  const observation_text = String(input.observation_text ?? "").trim();

  console.log("primaryChildId:", primaryChildId);
  console.log("observation_text length:", observation_text.length);

  if (!primaryChildId || !observation_text) {
    console.error("createObservation error: missing child_id or observation_text");
    return { error: "save_failed", reason: "missing_fields" };
  }

  const additionalChildIds = (input.additional_child_ids ?? [])
    .map(String)
    .filter(Boolean);
  const allChildIds = Array.from(new Set([primaryChildId, ...additionalChildIds]));

  const imageRaw = String(input.image_url ?? "").trim();
  const audioRaw = String(input.audio_url ?? "").trim();
  const image_url = parseMediaPath(input.image_url, user.id, "images");
  const audio_url = parseMediaPath(input.audio_url, user.id, "audio");

  if ((imageRaw && !image_url) || (audioRaw && !audio_url)) {
    console.error("createObservation error: invalid media paths", {
      imageRaw: Boolean(imageRaw),
      audioRaw: Boolean(audioRaw),
    });
    return { error: "invalid_media", reason: "path_validation_failed" };
  }

  const observed_at = parseObservedAt(input.observed_at);

  const inserts = allChildIds.map((child_id) =>
    buildObservationInsert(
      child_id,
      observation_text,
      observed_at,
      image_url,
      audio_url,
    ),
  );

  console.log("inserting observations:", inserts);

  const { error } = await supabase.from("observations").insert(inserts);

  if (error) {
    console.error("supabase insert error:", JSON.stringify(error));
    redirect(`/children/${primaryChildId}/observations/new`);
  }

  for (const childId of allChildIds) {
    revalidatePath(`/children/${childId}`);
  }

  redirect(`/children/${primaryChildId}`);
}

export async function createGroupObservation(formData: FormData) {
  const supabase = await createClient();

  const observation_text = String(formData.get("observation_text") ?? "").trim();
  const childIds = formData.getAll("child_ids").map(String).filter(Boolean);
  const observed_at = parseObservedAt(
    String(formData.get("observed_at") ?? ""),
  );

  if (!observation_text || childIds.length === 0) {
    redirect("/children");
  }

  const primaryId = randomUUID();
  const primaryChildId = childIds[0];
  const extraChildIds = childIds.slice(1);

  const { error: primaryError } = await supabase.from("observations").insert({
    id: primaryId,
    child_id: primaryChildId,
    observation_text,
    observed_at,
  });

  if (primaryError) {
    console.error("createGroupObservation insert error:", JSON.stringify(primaryError));
    redirect("/children");
  }

  if (extraChildIds.length > 0) {
    const extraInserts = extraChildIds.map((child_id) => ({
      child_id,
      observation_text,
      observed_at,
    }));
    const { error: extraError } = await supabase
      .from("observations")
      .insert(extraInserts);

    if (extraError) {
      console.error(
        "createGroupObservation additional insert error:",
        JSON.stringify(extraError),
      );
    }
  }

  revalidatePath(`/observations/${primaryId}`);

  for (const childId of childIds) {
    revalidatePath(`/children/${childId}`);
  }

  redirect(`/observations/${primaryId}`);
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
