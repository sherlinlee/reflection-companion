"use client";

import { signOut } from "@/app/actions/auth";
import { FormSubmitButton } from "@/components/form-submit-button";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <FormSubmitButton
        variant="ghost"
        size="sm"
        pendingLabel="Signing out…"
        className="text-[#8a9490] hover:bg-[#faf4e6] hover:text-[#9a7c2e]"
      >
        Sign out
      </FormSubmitButton>
    </form>
  );
}
