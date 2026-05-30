"use client";

import { useActionState } from "react";

import { signIn, signUp } from "@/app/actions/auth";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import {
  authCtaClass,
  authFieldClass,
  authFormClass,
  authTitleClass,
  pageEnterClass,
  sparkToolCardClass,
  staggerClass,
  taglineClass,
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
          <p className={taglineClass}>
            Revisit children&apos;s documentation through multiple lenses. You
            remain the thinker—we help you notice.
          </p>

          <a
            href="https://sparkbysher.onrender.com"
            className={sparkToolCardClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="spark-tool-card-label">Also from Spark by Sher</span>
            <span className="spark-tool-card-title">Spark tool</span>
            <span className="spark-tool-card-desc">
              Turn topics and classroom moments into provocations, inquiry
              questions, and environment setups.
            </span>
            <span className="spark-tool-card-link">
              Open sparkbysher.onrender.com{" "}
              <span className="spark-tool-card-arrow" aria-hidden>
                →
              </span>
            </span>
          </a>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <form action={signInAction} className={authFormClass}>
          <h2 className={authTitleClass}>Sign in</h2>
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className={authFieldClass}
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className={authFieldClass}
          />
          <Button
            type="submit"
            variant="cta"
            className={authCtaClass}
            disabled={signInPending}
          >
            {signInPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <form action={signUpAction} className={authFormClass}>
          <h2 className={authTitleClass}>Create account</h2>
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className={authFieldClass}
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 characters)"
            className={authFieldClass}
          />
          <Button
            type="submit"
            variant="outline"
            className="w-full border-[#1A7A6E]/30 text-[#1A7A6E] hover:bg-[#EAF5F3]"
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
