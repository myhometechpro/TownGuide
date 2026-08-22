# Welcome to Heber-Overgaard

A mobile-first, independent visitor guide for Heber-Overgaard, Arizona. Visitors can discover things to do, trails, food, lodging, events, deals, and local businesses after scanning tracked QR stickers. Public business and recreation listings are researched from current local and official sources; visitors should still verify time-sensitive details directly.

## Listing sources

Core business data was checked against the Heber-Overgaard Chamber of Commerce member directory and official business websites. Recreation data was checked against Navajo County, Visit Arizona, and the U.S. Forest Service Apache-Sitgreaves National Forests. Generic editorial photography is used until businesses provide licensed listing photos; it should not be interpreted as a photograph of a specific business.

## Stack

Next.js App Router, TypeScript, React, Tailwind CSS, Supabase Auth/PostgreSQL, and Netlify. The public guide uses researched local directory data; Supabase powers persistence, tracking, inquiries, authentication, and production analytics once configured.

## Local setup

1. Install Node.js 20 and run `npm install`.
2. Copy `.env.example` to `.env.local` and fill in Supabase values.
3. Run `npm run dev` and open `http://localhost:3000`.
4. Validate with `npm run typecheck` and `npm run build`.

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` are browser-safe. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed in client code or committed.

## Supabase

Create a project, open the SQL editor, and run `supabase/migrations/001_initial_schema.sql`. For development only, run `supabase/seed/seed.sql`. The migration enables RLS: anonymous visitors may read only active/current public content; tracking and inquiry writes pass through validated server routes; authenticated users manage content. Before inviting multiple admin users, replace the broad authenticated policies with an explicit admin-role claim.

Create the first admin under Supabase Authentication → Users. Add the production and local URLs to Authentication → URL Configuration. The `/admin` area checks the Supabase session when credentials are present.

## QR locations

Create a row in `qr_locations` with a unique `code`, name, optional business, and active status. Its public URL is `/go/{code}`. The server verifies the code, records a minimal scan record (device category, referrer, user agent; no GPS or visitor name), and redirects home. Generate printable artwork under `/admin/qr`.

## Netlify deployment

Connect this GitHub repository in Netlify. `netlify.toml` supplies `npm run build`, `.next`, and Node 20. Add all four environment variables in the Netlify UI; use the production site URL for `NEXT_PUBLIC_SITE_URL`. Add that URL to Supabase allowed redirect URLs. Never expose the service-role key as a public variable.

For updates, merge tested changes to the connected production branch. Netlify will build automatically. Run migrations before deploying code that depends on schema changes.

## Production checklist

- Continue verifying listings and replace generic editorial images with business-provided photography.
- Add authoritative visitor-resource URLs only after verification.
- Tighten admin authorization to an explicit claim/role.
- Test QR scans, RLS, inquiry validation, mobile navigation, keyboard access, and external directions.
- Configure a custom domain and update `NEXT_PUBLIC_SITE_URL` plus Supabase allowed URLs.

Payments and business-owner accounts are intentionally out of scope for this MVP.
