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

After pulling media features, also run migrations `003_observation_media.sql` and `004_educator_storage_events.sql` in the SQL Editor.

### Observation media (v1)

- **Caps:** 10 MB photo, 50 MB voice memo; **one photo + one voice memo** per observation.
- **Storage:** files live in the private `observation-media` bucket; Postgres stores **paths only** (`image_url`, `audio_url`), not file bytes.
- **Upload path:** files go **directly from the browser to Supabase Storage** (not through the Next.js server action), avoiding request body size limits on hosting.
- **Pilot storage tracking:** `educator_storage_events` logs upload/delete byte counts per educator. In SQL Editor:

```sql
select * from educator_storage_totals order by net_bytes desc;
```

## Deploy / Supabase auth

See [DEPLOY.md](./DEPLOY.md).
