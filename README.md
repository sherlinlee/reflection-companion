# Documentation Reflection Companion

Helps Reggio educators revisit children's documentation through multiple lenses—without replacing educator interpretation.

**Live app (Vercel):** https://doc-reflection-companion.vercel.app

**Deploy on Render:** see [DEPLOY-RENDER.md](./DEPLOY-RENDER.md)

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add OpenAI + Supabase keys. Run `supabase/schema.sql` in your Supabase SQL Editor.

## Deploy / Supabase auth

See [DEPLOY.md](./DEPLOY.md).
