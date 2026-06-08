"use client";

import { useActionState } from "react";

import { inviteCoEducator } from "@/app/actions/collaborators";
import { FormSubmitButton } from "@/components/form-submit-button";
import { fieldClass } from "@/lib/ui-classes";

type FormState = { error?: string; ok?: boolean } | null;

async function handleInvite(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const result = await inviteCoEducator(email);
  if ("error" in result) return { error: result.error };
  return { ok: true };
}

export function CoEducatorInviteForm() {
  const [state, action] = useActionState(handleInvite, null);

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-[12px] font-medium text-[#3d4f4c]">
          Co-educator email
        </span>
        <input
          type="email"
          name="email"
          required
          placeholder="colleague@school.edu"
          className={fieldClass}
        />
      </label>
      <FormSubmitButton variant="cta" pendingLabel="Sending…">
        Send invite
      </FormSubmitButton>
      {state?.error && (
        <p role="alert" className="text-[12px] text-red-700 sm:basis-full">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-[12px] text-[#9a7c2e] sm:basis-full">
          Invite sent. They will get access when they sign up with that email.
        </p>
      )}
    </form>
  );
}
