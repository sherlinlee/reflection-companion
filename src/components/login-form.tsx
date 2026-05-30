"use client";

import { useActionState } from "react";

import { signIn, signUp } from "@/app/actions/auth";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import {
  cardClass,
  fieldClass,
  pageEnterClass,
  pullQuoteClass,
  staggerClass,
} from "@/lib/ui-classes";

export function LoginForm() {
  const [signInState, signInAction, signInPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await signIn(formData)) ?? null;
    },
    null,
  );

  const [signUpState, signUpAction, signUpPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await signUp(formData)) ?? null;
    },
    null,
  );

  const error = signInState?.error ?? signUpState?.error;

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div
        className={`w-full max-w-[680px] space-y-8 ${pageEnterClass} ${staggerClass}`}
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <BrandMark variant="login" />
          </div>
          <p className={pullQuoteClass}>
            Revisit children&apos;s documentation through multiple lenses. You
            remain the thinker—we help you notice.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <form action={signInAction} className={`${cardClass} space-y-4`}>
          <h2 className="font-heading text-xl font-semibold text-[#0F1A18]">
            Sign in
          </h2>
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className={fieldClass}
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className={fieldClass}
          />
          <Button
            type="submit"
            variant="cta"
            className="w-full"
            size="lg"
            disabled={signInPending}
          >
            {signInPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <form action={signUpAction} className={`${cardClass} space-y-4`}>
          <h2 className="font-heading text-xl font-semibold text-[#0F1A18]">
            Create account
          </h2>
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className={fieldClass}
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 characters)"
            className={fieldClass}
          />
          <Button
            type="submit"
            variant="outline"
            className="w-full border-[#1A7A6E]/30 text-[#1A7A6E] hover:bg-[#EAF5F3]"
            size="lg"
            disabled={signUpPending}
          >
            {signUpPending ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-xs text-[#7A9490]">
          Reggio-inspired · Inquiry-led ·{" "}
          <a
            href="https://sparkbysher.com"
            className="font-medium text-[#1A7A6E] underline-offset-2 transition-colors hover:text-[#2A9D8F] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            sparkbysher.com
          </a>
        </p>
      </div>
    </div>
  );
}
