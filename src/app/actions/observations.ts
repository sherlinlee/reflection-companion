"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function createObservation(formData: FormData) {
  const supabase = await createClient();
  const childId = String(formData.get("child_id") ?? "");
  const observation_text = String(formData.get("observation_text") ?? "").trim();

  if (!childId || !observation_text) {
    redirect(`/children/${childId}/observations/new`);
  }

  const { data, error } = await supabase
    .from("observations")
    .insert({ child_id: childId, observation_text })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/children/${childId}/observations/new`);
  }

  revalidatePath(`/children/${childId}`);
  redirect(`/observations/${data.id}`);
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
