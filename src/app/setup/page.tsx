import Link from "next/link";

export default function SetupPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 space-y-6">
      <h1 className="text-2xl font-semibold">Setup required</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Add Supabase to <code className="text-foreground">.env.local</code>, then
        run the SQL in <code className="text-foreground">supabase/schema.sql</code>{" "}
        in your Supabase project&apos;s SQL Editor.
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>Create a project at supabase.com</li>
        <li>
          Copy Project URL and anon key into{" "}
          <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        </li>
        <li>Run <code className="text-foreground">supabase/schema.sql</code></li>
        <li>Restart the dev server</li>
      </ol>
      <Link href="/login" className="text-sm font-medium text-primary underline">
        Go to sign in
      </Link>
    </main>
  );
}
