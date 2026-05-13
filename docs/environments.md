# Environments for Vortech 360

Use this checklist when clicking **Create New Environment** in GitHub, Vercel, Supabase, or any deployment platform.

## Recommended environments

| Environment | Purpose | Supabase project | Data policy |
| --- | --- | --- | --- |
| `local` | Developer machine with `npm run dev` | Optional | Can run local-first without Supabase |
| `preview` | Pull request / staging deployments | Separate Supabase staging project | Test data only |
| `production` | Live app | Production Supabase project | Real project data |

## Required variables

Add these variables to each hosted environment. Do **not** commit real values to Git. Template files are available at `.env.local.example`, `.env.preview.example`, and `.env.production.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
SUPABASE_FLOORPLANS_BUCKET=floorplans
SUPABASE_ATTACHMENTS_BUCKET=attachments
NEXT_PUBLIC_APP_URL=https://your-deployment-url.example
```

## Local setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

If `.env.local` is not configured yet, the app still supports local-first testing for projects, floorplans, and zones. Server-backed Supabase persistence starts after the Supabase variables are set and the dev server is restarted.

## GitHub Environment checklist

1. Open the repository settings.
2. Go to **Settings → Environments → New environment**.
3. Create one environment named `preview` and another named `production`.
4. Use `.env.preview.example` and `.env.production.example` as the checklist for values, then add environment secrets for:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_FLOORPLANS_BUCKET`
   - `SUPABASE_ATTACHMENTS_BUCKET`
   - `NEXT_PUBLIC_APP_URL`
5. Protect `production` with required reviewers before deployment.

## Vercel Environment checklist

1. Open the project in Vercel.
2. Go to **Settings → Environment Variables**.
3. Add the variables above for:
   - **Development**
   - **Preview**
   - **Production**
4. Redeploy after editing variables.

## Supabase checklist per environment

For each Supabase project:

1. Run `supabase/schema.sql` in the SQL editor.
2. Create Storage buckets:
   - `floorplans`
   - `attachments`
3. Copy the project URL and anon key into the environment variables.
4. Copy the service role key only into server-side secret storage. Never expose it in client code.

## Validation commands

Run these before deploying or merging:

```bash
npm run lint
npm run typecheck
npm run build
```
