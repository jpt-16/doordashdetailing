# Spiff (placeholder name)

On-demand mobile car detailing marketplace prototype. Rename the product in `config/brand.ts`.

Stack: Next.js (App Router) + TypeScript + Tailwind, Supabase (Postgres, Auth, RLS, Storage), Stripe Connect (test mode only), Vercel.

## Build status

- [x] Step 2: auth and roles (this commit)
- [ ] Steps 3–9: profile onboarding, public page, booking, browse, job lifecycle, reviews, dashboards, seed data

## Setup

1. `npm install`
2. Create a free project at supabase.com (or run locally with the Supabase CLI: `supabase init && supabase start`).
3. Apply the SQL in `supabase/migrations/` in order (SQL Editor, or `supabase db push` / `supabase db reset` locally).
4. In Supabase: Authentication > Providers > Email. For quick demos turn **Confirm email** off. If left on, signup tells users to check their email, and Authentication > URL Configuration must include your site URL.
5. `cp .env.example .env.local` and fill in the Supabase URL and anon key (Project Settings > API). Leave `SUPABASE_SERVICE_ROLE_KEY` server-side only; it is not needed yet.
6. `npm run dev` and open http://localhost:3000.

### Creating an admin

Admins can't be created from the signup form. Sign up normally, then run in the SQL Editor:

```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
```

Log in and go to `/admin` to approve detailers and toggle the manual "verified" flag.

## Roles

| Role | Created by | Lands on |
|---|---|---|
| customer | signup | `/dashboard/customer` |
| detailer (starts `pending`) | signup | `/dashboard/detailer` |
| admin | SQL above | `/admin` |

Security notes: roles, detailer `status`, `verified` and `stripe_account_id` are protected by database triggers plus RLS, so a user can't promote themselves even by calling the API directly. The service-role key is only used from `src/lib/supabase/admin.ts` (`server-only`).
