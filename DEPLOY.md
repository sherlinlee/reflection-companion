# Deploy for educators (one link)

## Live app

**https://doc-reflection-companion.vercel.app**

Share this link with educators. They only need: create account → add child → add observation → generate reflection.

---

## 1. Deploy to Vercel (one-time)

In PowerShell, from this folder:

```powershell
npx vercel@latest login
npx vercel@latest link
npx vercel@latest env add OPENAI_API_KEY
npx vercel@latest env add NEXT_PUBLIC_SUPABASE_URL
npx vercel@latest env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel@latest deploy --prod
```

Copy the production URL (e.g. `https://doc-reflection-companion.vercel.app`).

`NEXT_PUBLIC_APP_URL` is optional on Vercel—the app uses the Vercel URL automatically.

## 2. Configure Supabase (required once — ~2 minutes)

Production URL: **https://doc-reflection-companion.vercel.app**

**Option A — Script**

```powershell
$env:SUPABASE_ACCESS_TOKEN = "paste-from-https://supabase.com/dashboard/account/tokens"
cd c:\dev\doc-reflection-companion
.\scripts\configure-supabase.ps1 -SiteUrl "https://doc-reflection-companion.vercel.app"
```

**Option B — Dashboard**

1. Open [URL configuration](https://supabase.com/dashboard/project/xrqyfiirymicgkqwxyky/auth/url-configuration)
2. **Site URL:** `https://doc-reflection-companion.vercel.app`
3. **Redirect URLs:** add `https://doc-reflection-companion.vercel.app/auth/callback`
4. Open [Email provider](https://supabase.com/dashboard/project/xrqyfiirymicgkqwxyky/auth/providers) → turn **off** “Confirm email” → Save

## 3. Share with educators

Send one link:

`https://YOUR-VERCEL-URL.vercel.app`

They: **Create account → Add child → Add observation → Generate reflection**

No terminal, SQL, or localhost.
