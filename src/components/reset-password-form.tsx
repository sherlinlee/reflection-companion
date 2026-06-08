"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { updatePassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  authCtaClass,
  authFieldClass,
  authFormClass,
  authTitleClass,
  pageEnterClass,
} from "@/lib/ui-classes";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await updatePassword(formData)) ?? null;
    },
    null,
  );

  return (
    <div
      className={`mx-auto w-full max-w-[680px] px-4 py-12 sm:py-16 ${pageEnterClass}`}
    >
      <form action={action} className={authFormClass}>
        <h1 className={authTitleClass}>Set a new password</h1>
        <p className="text-center text-[13px] leading-[1.6] text-[#8a9490]">
          Choose a new password for your account.
        </p>

        {state?.error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          >
            {state.error}
          </p>
        )}

        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="New password (min 6 characters)"
          className={authFieldClass}
        />
        <input
          name="confirm_password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Confirm new password"
          className={authFieldClass}
        />
        <Button
          type="submit"
          variant="cta"
          className={authCtaClass}
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </form>
    </div>
  );
}
