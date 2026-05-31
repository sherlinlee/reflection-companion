"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function createObservation(formData: FormData) {
  const supabase = await createClient();

  const primaryChildId = String(formData.get("child_id") ?? "");
  const observation_text = String(formData.get("observation_text") ?? "").trim();

  if (!primaryChildId || !observation_text) {
    redirect(`/children/${primaryChildId}/observations/new`);
  }

  // Collect all selected child IDs (primary + any additional)
  const additionalChildIds = formData.getAll("additional_child_ids").map(String);
  const allChildIds = Array.from(new Set([primaryChildId, ...additionalChildIds]));

  // Insert one observation per child
  const inserts = allChildIds.map((child_id) => ({
    child_id,
    observation_text,
  }));

  const { data, error } = await supabase
    .from("observations")
    .insert(inserts)
    .select("id, child_id");

  if (error || !data || data.length === 0) {
    redirect(`/children/${primaryChildId}/observations/new`);
  }

  // Revalidate all affected child pages
  for (const childId of allChildIds) {
    revalidatePath(`/children/${childId}`);
  }

  // Redirect to the primary child's observation
  const primaryObs = data.find((d) => d.child_id === primaryChildId) ?? data[0];
  redirect(`/observations/${primaryObs.id}`);
}

export async function updateObservation(formData: FormData) {
  const supabase = await createClient();
  const observationId = String(formData.get("observation_id") ?? "");
  const childId = String(formData.get("child_id") ?? "");
  const observation_text = String(formData.get("observation_text") ?? "").trim();

  if (!observationId || !observation_text) {
    redirect(`/observations/${observationId}`);
  }

  await supabase
    .from("reflections")
    .delete()
    .eq("observation_id", observationId);

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

  await supabase.from("child_reflections").delete().eq("child_id", childId);
  await supabase.from("observations").delete().eq("id", observationId);

  revalidatePath(`/children/${childId}`);
  redirect(`/children/${childId}`);
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

  // Redirect to first child's observation
  redirect(`/observations/${data[0].id}`);
}