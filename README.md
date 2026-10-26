# toodooloo

A simple to-do app. Sign up, manage your own to-do list, reset your password by email.

Built with Next.js 16, Postgres + Prisma 7, Tailwind and Resend.

## Run it locally

You need Node 22+ and Docker.

```bash
npm install
cp .env.example .env
npm run db:up        # starts Postgres in Docker on port 5433
npm run db:migrate   # creates the tables
npm run dev          # http://localhost:3000
```

### Password reset emails in dev

Leave `RESEND_API_KEY` empty and reset emails are printed in the `npm run dev` terminal, with the link to click. They are also appended to `.dev-emails.jsonl`.

To send real emails, add a [Resend](https://resend.com) API key to `.env`. Resend's test sender (`onboarding@resend.dev`) only delivers to the email you signed up to Resend with. To email anyone, verify a domain in Resend and set `EMAIL_FROM` to an address on it.

## Tests

```bash
npm test             # unit tests (Vitest)
npm run test:e2e     # end-to-end (Playwright), starts the dev server if it isn't running
```

First time only: `npx playwright install chromium`. The database must be running.

## How it works

| Part | Where |
|---|---|
| Pages | `src/app/` (`/`, `/login`, `/register`, `/forgot-password`, `/reset-password`) |
| Server actions | `src/app/actions/auth.ts`, `src/app/actions/todos.ts` |
| Session → user lookup | `src/lib/dal.ts` |
| Sessions | `src/lib/session.ts` — random token in an httpOnly cookie, only its SHA-256 hash is stored |
| Schema | `prisma/schema.prisma` |

Security notes:
- Passwords are hashed with bcrypt.
- Reset links expire after 1 hour, work once, and only the newest link is valid. Resetting signs out every device.
- The forgot-password form gives the same reply whether or not the email has an account.
- Every to-do query is scoped to the signed-in user.
- Rate limiting is in-memory and only on in production. On Vercel each instance has its own memory, so it's a light guard, not a real limit. Swap in a shared store (e.g. Upstash Redis) if abuse becomes a concern.

## Deploying to Vercel

1. Create a Postgres database (e.g. Neon, or Vercel's Postgres integration) and copy its connection string.
2. Import this repo in Vercel.
3. Set environment variables: `DATABASE_URL`, `APP_URL` (your Vercel URL, e.g. `https://toodooloo.vercel.app`), `RESEND_API_KEY`, `EMAIL_FROM`.
4. Deploy. `npm run build` runs `prisma migrate deploy` first, so tables are created on each deploy.
