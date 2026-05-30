import { signOut } from "@/app/actions/auth";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="border-b border-[rgba(26,122,110,0.12)] bg-[#ffffff] shadow-[0_2px_10px_rgba(26,122,110,0.04)]">
      <div className="mx-auto flex max-w-[680px] flex-col gap-4 px-4 py-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <BrandMark />
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-[#7A9490] hover:text-[#1A7A6E] hover:bg-[#EAF5F3]"
            >
              Sign out
            </Button>
          </form>
        </div>
        <div className="space-y-2 border-t border-[rgba(168,213,207,0.5)] pt-4">
          <h1 className="font-heading text-[clamp(1.35rem,4vw,1.75rem)] font-semibold leading-[1.28] tracking-[-0.02em] text-[#0F1A18]">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-xl text-[15px] leading-[1.75] text-[#3D4F4C]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
