# Supabase setup

Rally now stores everything in Supabase (Auth + Postgres). Data is read/written
from the browser via `supabase-js`, and **row-level security** (defined in
`supabase/migrations/`) keeps each player scoped to their own rows.

## One-time setup (hosted project)

1. **Create a project** at [database.new](https://database.new) (or
   `npx supabase projects create rally`). Note the **project ref** (the
   `abcd1234...` in the dashboard URL).

2. **Log in and link the CLI:**
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   ```

3. **Push the schema** (creates tables, RLS policies, triggers, and the demo
   players):
   ```bash
   npx supabase db push
   ```

4. **Turn off email confirmation** so signups can log in immediately:
   Dashboard → **Authentication → Sign In / Providers → Email** → disable
   *Confirm email*. (Leave it on if you want real email verification — the
   signup form already handles the "check your email" case.)

5. **Add the API keys** to `.env.local` (copy from `.env.example`). Find them in
   Dashboard → **Project Settings → API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
   ```
   You can also pull them with: `npx supabase projects api-keys --project-ref <ref>`

6. **Run it:**
   ```bash
   npm run dev
   ```

For Vercel, add the same two `NEXT_PUBLIC_*` vars in the project's Environment
Variables (or `vercel env add`).

## Local development (optional, needs Docker)

If you'd rather run the stack offline, install Docker Desktop, then:
```bash
npx supabase start          # boots Postgres + Auth locally, applies migrations
```
Use the URL/anon key it prints in `.env.local`. `npx supabase db reset`
re-applies all migrations from scratch.

## Schema overview

| Table          | Purpose                                                        |
| -------------- | ------------------------------------------------------------- |
| `profiles`     | One row per player. Real users mirror `auth.users` via a trigger; demo players have no auth account. |
| `availability` | A player's weekly slots (`day|time`) + note.                  |
| `requests`     | Match requests between two players (`pending`/`accepted`/`declined`). |
| `games`        | Scheduled games, auto-created by a trigger when a request is accepted. |

Two triggers do the heavy lifting:
- `handle_new_user` — creates a profile from signup metadata and seeds a couple
  of welcome requests from demo players.
- `handle_request_accepted` — turns an accepted request into a game.
