# Development setup

Use Node 24.21.0 (`.nvmrc`), npm 11.19.0 and the committed `package-lock.json`. `npm ci` installs exact versions, including Supabase CLI 2.121.0. No hosted credentials are required for the default demonstration or CI.

## Application

```sh
npm ci
npm run dev -- --port 3411
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

The synthetic review UI uses browser-local drafts. The separate `/conexao` flow uses the ignored hosted settings described in [connected-workspace.md](connected-workspace.md). Never replace an existing `.env.local` to run tests.

## Disposable local database and real API tests

Start a Docker-compatible container runtime, then run from this checkout:

```sh
npm run db:start
npm run db:test
npm run test:api
npm run db:stop
```

The first start downloads images, applies every versioned migration and seeds four fictional Auth accounts, two consultancies and two independently scoped companies within the first consultancy. The fixed `@ambientis.test` accounts and test-only password are in `supabase/seed.sql`. They are deliberately public fixtures and must never be copied to a hosted project. Local signup and anonymous sign-in are disabled. Email is captured locally; no external emails are sent.

Ports: API 54621, PostgreSQL 54622, local mail viewer 54624. The integration runner discovers this checkout's CLI status internally, refuses a non-loopback API, signs in the seeded users and starts a separate app on port 3421. Keep 3421 free. Its build output uses `.next-integration`; it does not terminate the user's preview or access its browser drafts. The runner passes local settings directly to the child process, overriding hosted `.env.local` values without editing that file. Local credentials and server output are not printed by the runner. `supabase start` itself prints local credentials, so redirect its output when collecting public evidence.

`SUPABASE_LOCAL_MODE=true` permits only `http://127.0.0.1:54621` with a publishable key in development/test. Production and Vercel retain the hosted HTTPS-only requirement. The application never receives a service-role credential. The integration harness uses the discovered **local** administrator only to revoke/restore a seeded membership; this is not an application capability.

`db:test` runs SQL assertions inside a rollback transaction through pgTAP. `test:api` exercises real Auth, PostgREST and Next route handlers, including disabled signup, anonymous/forged access, cross-tenant and same-consultancy isolation, sharing, role escalation, cross-tenant references, immutable audit, live revocation, server authorship and concurrent revision conflicts. API fixtures remain local and traceable; synthetic concurrency fixtures are archived after success. Repeated tests do not reset or delete databases.

`db:stop` retains local database data. No reset, cloud link, remote migration or production seed command is part of these scripts. After changing a migration or seed, use a separately identified disposable stack or obtain approval before resetting an existing stack. Never reset a hosted project or an unidentified local database.

## CI and boundaries

`local-review` checks lint, TypeScript, Vitest, Chromium journeys and a production build. `database-api` starts fresh local services, runs SQL and actual API tests, then stops services even after failure. Neither job reads production secrets or deploys migrations. Fork PRs need no privileged credentials.

A passing foundation does not implement password recovery/MFA, invitation administration, private Storage, final approval, technical calculations, backup recovery or professional acceptance. Track those in their own open issues. Do not use real client data before the operational gates pass.
