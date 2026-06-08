import { BrandMark } from "@/components/brand-mark";
import { SignOutButton } from "@/components/sign-out-button";

export function AppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="spark-header">
      <div className="mx-auto flex max-w-[680px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <div className="flex items-center gap-4">
          <BrandMark variant="header" />
          {title && (
            <div className="hidden border-l border-[rgba(154,124,46,0.2)] pl-4 sm:block">
              <p className="text-[13px] font-medium leading-tight text-[#0f1a18]">
                {title}
              </p>
              {subtitle && (
                <p className="text-[11px] leading-tight text-[#8a9490]">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}