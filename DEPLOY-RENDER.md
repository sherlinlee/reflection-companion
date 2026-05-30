# Deploy on Render

You can run this app on [Render](https://render.com) instead of (or alongside) Vercel. Supabase stays the same.

## 1. Push code to GitHub

Render deploys from Git. If the project isn’t on GitHub yet:

```powershell
cd c:\dev\doc-reflection-companion
git add -A
git commit -m "Prepare for Render deploy"
```

Create a new repo on GitHub, then:

```powershell
git remote add origin https://github.com/YOUR_USER/doc-reflection-companion.git
git push -u origin main
```

(Use `master` instead of `main` if that’s your default branch.)

## 2. Create the web service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Connect your GitHub account and select **doc-reflection-companion**
3. Settings (Render usually detects Next.js):

   | Setting | Value |
   |--------|--------|
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Plan** | Free (or paid for always-on) |

4. **Environment** → add:

   | Key | Value |
   |-----|--------|
   | `OPENAI_API_KEY` | from `.env.local` |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xrqyfiirymicgkqwxyky.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your publishable key |

   You do **not** need `NEXT_PUBLIC_APP_URL` on Render—Render sets `RENDER_EXTERNAL_URL` automatically.

5. Click **Create Web Service** and wait for the first deploy (~5–10 min).

6. Copy your live URL, e.g. `https://doc-reflection-companion.onrender.com`

**Optional:** **New +** → **Blueprint** and point at the repo—`render.yaml` in the repo applies the same settings.

## 3. Update Supabase for the Render URL

Use your **Render** URL (not Vercel) for auth:

**Dashboard**

1. [URL configuration](https://supabase.com/dashboard/project/xrqyfiirymicgkqwxyky/auth/url-configuration)
2. **Site URL:** `https://YOUR-SERVICE.onrender.com`
3. **Redirect URLs:** add `https://YOUR-SERVICE.onrender.com/auth/callback`
   (You can keep the Vercel URLs too if both hosts are active.)
4. [Email provider](https://supabase.com/dashboard/project/xrqyfiirymicgkqwxyky/auth/providers) → **Confirm email** off (recommended for pilots)

**Or script**

```powershell
$env:SUPABASE_ACCESS_TOKEN = "your-token"
.\scripts\configure-supabase.ps1 -SiteUrl "https://YOUR-SERVICE.onrender.com"
```

## 4. Share with educators

One link: `https://YOUR-SERVICE.onrender.com`

## Notes

- **Free plan:** the app sleeps after ~15 min idle; first visit may take 30–60 seconds to wake up.
- **Vercel:** you can stop using it after Render works, or delete the Vercel project to avoid two live URLs.
- **Database:** still Supabase—no change to `schema.sql` / migrations.
