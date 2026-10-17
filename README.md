# InfraMap

InfraMap is a React/Vite application backed by Supabase for authentication,
database access, realtime updates, and report-photo storage.

## Run locally

1. Install Node.js and npm.
2. From the project directory, run `npm install`.
3. Run `npm run dev` and open the local URL printed by Vite.

Configure the Supabase URL and public anon/publishable key in a `.env.local`
file at the project root, using `.env.example` as a template. Copy these values
from **Project Settings → API Keys** in the Supabase dashboard. Only the public
anon/publishable key belongs in browser code; never put a Supabase service-role
key in the frontend. Restart the Vite server after changing environment values.

## Prepare Supabase

1. Open the Supabase SQL Editor and run
   [`supabase/migrations/20261016214500_initial_schema.sql`](./supabase/migrations/20261016214500_initial_schema.sql).
2. In **Authentication → URL Configuration**, set the local site URL to
   `http://localhost:5173` and allow the local `/reset-password` redirect.
3. If signup should use the six-digit code screen, change the **Confirm signup**
   email template to include `{{ .Token }}`.
4. Register the first administrator and promote that profile using the SQL in
   [`supabase/README.md`](./supabase/README.md).
5. Enable Google as an Auth provider if Google sign-in is needed.

Supabase Auth and Postgres access are restricted to
`@ietirafaelnaviavaron.edu.co` addresses and `admininframap@gmail.com`.

## Email delivery

Supabase Auth sends signup and password-reset emails. The custom welcome,
resolution, and admin test emails use the `send-email` Edge Function and Resend.
Deploy it and configure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` as Supabase
Function secrets before using those actions. The deployment and schema steps
are documented in [`supabase/README.md`](./supabase/README.md).

## Useful commands

- `npm run dev` — start Vite locally.
- `npm run build` — build the production bundle.
- `npm run lint` — run ESLint.
