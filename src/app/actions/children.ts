"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function createChild(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const ageRaw = String(formData.get("age") ?? "").trim();
  const class_name = String(formData.get("class_name") ?? "").trim() || null;
  const age = ageRaw ? parseInt(ageRaw, 10) : null;

  if (!name) redirect("/children");

  const { error } = await supabase.from("children").insert({
    educator_id: user.id,
    name,
    age: Number.isNaN(age) ? null : age,
    class_name,
  });

  if (error) redirect("/children");

  revalidatePath("/children");
  redirect("/children");
}

export async function updateChild(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const childId = String(formData.get("child_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const ageRaw = String(formData.get("age") ?? "").trim();
  const class_name = String(formData.get("class_name") ?? "").trim() || null;
  const age = ageRaw ? parseInt(ageRaw, 10) : null;

  if (!childId || !name) redirect("/children");

  const { error } = await supabase
    .from("children")
    .update({
      name,
      age: Number.isNaN(age) ? null : age,
      class_name,
    })
    .eq("id", childId);

  if (error) redirect(`/children/${childId}`);

  revalidatePath("/children");
  revalidatePath(`/children/${childId}`);
  redirect(`/children/${childId}`);
}

export async function deleteChild(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const childId = String(formData.get("child_id") ?? "");
  if (!childId) redirect("/children");

  await supabase.from("children").delete().eq("id", childId);

  revalidatePath("/children");
  redirect("/children");
}
