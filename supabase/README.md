# InfraMap Supabase setup

## Create the database schema

In the Supabase project, open **SQL Editor**, paste the contents of
[`migrations/20261016214500_initial_schema.sql`](./migrations/20261016214500_initial_schema.sql),
and run it once. This creates the application tables, indexes, profile
creation trigger, realtime publication entries, Storage bucket, and row-level
security policies.

The migration creates these tables:

- `profiles`: one profile per Supabase Auth user; new users always start as `user`.
- `reports`: school infrastructure reports, including status, location, photos,
  and upvotes.
- `comments`: comments linked to reports.
- `notifications`: admin and recipient notifications.
- `email_logs`: email-flow status, visible only to admins.
- `report-photos` Storage bucket: public report-photo downloads, with uploads
  restricted to an authenticated user's own `<user-id>/` folder.

The frontend currently points to a Supabase project in `src/supabaseClient.js`.
Check that it is the same project where you ran the migration.

## Promote the first administrator

Register the intended administrator through Supabase Auth first. Then run this
in the SQL Editor, replacing the address with that account's email:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where lower(email) = lower('admin@example.com')
);
```

## Auth and local redirect settings

In **Authentication → URL Configuration**, set the local site URL to
`http://localhost:5173` and add `http://localhost:5173/reset-password` to the
allowed redirect URLs. If the signup screen should accept the six-digit code,
set the **Confirm signup** email template to use `{{ .Token }}`.

Enable the Google provider in **Authentication → Providers** if Google sign-in
is required. Google OAuth credentials must also include the Supabase callback
URL shown in that provider's settings.

## Custom email function

The `send-email` Edge Function uses Resend for welcome, resolution, and admin
test messages. Deploy it with the Supabase CLI, then configure these function
secrets:

```text
RESEND_API_KEY=<Resend API key>
RESEND_FROM_EMAIL=<verified sender, e.g. InfraMap <avisos@example.com>>
```

The `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
environment variables are provided by Supabase Functions. Never put the
service-role key in the frontend.

With the Supabase CLI installed and linked to the project, deploy it and add
the Resend secrets:

```powershell
supabase functions deploy send-email
supabase secrets set RESEND_API_KEY="your-resend-api-key" RESEND_FROM_EMAIL="InfraMap <avisos@example.com>"
```

Use a sender address/domain verified with Resend. Until this function is
deployed, email features that use it will show an error; Auth signup and
password-reset emails are sent separately by Supabase Auth.

## Current application status

The frontend has been switched to Supabase. Applying the SQL migration and
configuring Auth are required before using protected pages. Custom email
delivery additionally requires deploying the Edge Function and setting its
Resend secrets.
