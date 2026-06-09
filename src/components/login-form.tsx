"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";

import { requestPasswordReset, signIn, signUp } from "@/app/actions/auth";
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
  taglineCardClass,
  taglineClass,
} from "@/lib/ui-classes";

export function LoginForm() {
  const [showForgot, setShowForgot] = useState(false);

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

  const [resetState, resetAction, resetPending] = useActionState(
    async (
      _prev: { error?: string; ok?: true; message?: string } | null,
      formData: FormData,
    ) => {
      return (await requestPasswordReset(formData)) ?? null;
    },
    null,
  );

  const error = signInState?.error ?? signUpState?.error ?? resetState?.error;

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div
        className={`w-full max-w-[680px] space-y-8 ${pageEnterClass} ${staggerClass}`}
      >
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <BrandMark variant="login" />
          </div>
          <div className={taglineCardClass}>
            <span className="spark-tagline-card-mark" aria-hidden>
              ✦
            </span>
            <p className={taglineClass}>
              <span className="block">
                Revisit children&apos;s documentation through multiple lenses.
              </span>
              <span className="block mt-1.5">
                You remain the thinker—we help you notice.
              </span>
            </p>
          </div>

          <a
            href="https://sparkbysher.onrender.com"
            className={sparkToolCardClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="spark-tool-card-label">Also from Spark by Sher</span>
            <span className="spark-tool-card-title">Spark Provocation Tool</span>
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
            {signInPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <button
            type="button"
            onClick={() => setShowForgot((v) => !v)}
            className="text-center text-[12px] font-medium text-[#1A7A6E] transition-colors hover:text-[#2A9D8F]"
          >
            {showForgot ? "Back to sign in" : "Forgot password?"}
          </button>
        </form>

        {showForgot && (
          <form action={resetAction} className={authFormClass}>
            <h2 className={authTitleClass}>Reset password</h2>
            <p className="text-center text-[13px] leading-[1.6] text-[#8a9490]">
              Enter your account email and we&apos;ll send you a reset link.
            </p>
            {resetState?.ok && resetState.message && (
              <p className="rounded-lg border border-[rgba(26,122,110,0.2)] bg-[#EAF5F3] px-4 py-3 text-center text-sm text-[#1A7A6E]">
                {resetState.message}
              </p>
            )}
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className={authFieldClass}
            />
            <Button
              type="submit"
              variant="outline"
              className="w-full border-[#1A7A6E]/30 text-[#1A7A6E] hover:bg-[#EAF5F3]"
              disabled={resetPending}
            >
              {resetPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        )}

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
            {signUpPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create account"
            )}
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
