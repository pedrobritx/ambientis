# Connected workspace and API

## Local setup

Use the pinned Node runtime. Copy `.env.example` to ignored `.env.local` and enter the selected project's URL and **publishable** key. Restart the local server and open `/conexao` (also linked from the demo footer). Do not configure a service-role or secret key; this adapter rejects that key type.

The first account must be created by the administrator in this project's Supabase Auth. No email/account has been provisioned by this work. Sign in, create the team's workspace and add a fictional company. Sessions stay in memory and are not written to browser storage. Keep synthetic data while this foundation is under review. Existing demo data remains only in its original browser; there is no automatic import.

A publishable key identifies the application; a validated Supabase Auth bearer token identifies the person. Both are required for data calls. Management access used to apply migrations is separate from normal application requests. See [Supabase API key guidance](https://supabase.com/docs/guides/getting-started/api-keys).

## Contract

All endpoints use `/api/v1/{resource}`, `Authorization: Bearer <user-access-token>`, JSON writes and private/no-store responses. There is no cookie authentication or permissive CORS. Unknown resources return 404. Request bodies are bounded to 32 KiB and reject unknown fields.

| Resource | Operations | Important fields |
|---|---|---|
| organizations | GET, POST | POST `{ "name": "Synthetic team" }` bootstraps/returns the owner's workspace |
| companies | GET, POST, PATCH | organization_id, name, sector; optional normalized/checksummed CNPJ and CNAE |
| company_contacts | GET, POST, PATCH | organization_id, company_id, name, position, email, phone |
| facilities | GET, POST, PATCH | organization_id, company_id, name, sector, state (GO/DF), city, postcode |
| processes | GET, POST, PATCH | organization_id, facility_id, title, reporting_period, draft/collecting/reviewing |
| requirements | GET, POST, PATCH | organization_id, facility_id, process_id, title, description, source, shared_with_client |
| document_requests | GET, POST, PATCH | organization_id, facility_id, process_id, requirement_id, message, due_date, draft/sent/cancelled |

Resource GET requires `organization_id` and accepts `limit` (1–100, default 50) and UUID `after` cursor. The response is `{ data: [...], next_cursor: uuid | null }`. Organizations GET returns only visible memberships, up to 100 organizations. RLS still filters queries that omit facility/company filters.

POST returns `{ data: record }` with status 201 (organization bootstrap returns `{ data: { id } }`). A record update sends:

```json
{
  "id": "10000000-0000-4000-8000-000000000001",
  "organization_id": "20000000-0000-4000-8000-000000000001",
  "version": 1,
  "changes": { "name": "Updated synthetic company" }
}
```

The API adds the next version and checks the previous one in the same update. Identity/relationship keys, authorship, permissions and timestamps cannot appear in changes. A stale or inaccessible update returns a generic 409 without confirming whether a foreign record exists. 401 requires sign-in; 403 denies the operation; 409 covers revision/uniqueness conflicts; 422 identifies invalid data/relationships; 503 is retryable provider/configuration failure. Provider errors, tokens and SQL details are not returned.

Requirement PATCH additionally supports pending/applicable/excluded and exclusion_reason. An exclusion requires a nonempty explanation in the database. CNPJ cannot be reassigned after its first non-null value. Company/record identity changes need a deliberate future workflow.

`profiles`, memberships, access grants and audit are not mutable API resources. Owners administer directory data; assigned technical responsible/analyst roles manage work. Clients cannot write technical records or read other contacts/audit. The database role matrix is described in [ADR 0009](../adr/0009-connected-workspace-foundation.md).

## Migrations and tests

SQL migrations are additive and named with the actual applied Supabase versions. Do not reset this project or use destructive rollback scripts. Generate types from the project's current schema into `src/lib/supabase/database.types.ts` after schema changes.

- `npm test`: domain/API contracts and migrations/RLS on embedded PostgreSQL.
- `supabase/tests/workspace_rls.sql`: transaction-scoped test on the target project; always ends in ROLLBACK. Synthetic Auth users, organizations, contacts and audit are not retained.
- `npm run test:e2e`: synthetic browser workflows, mobile checkbox/button checks, connection accessibility and unauthenticated API rejection.
- `npm run typecheck`, `npm run lint`, `npm run build`.

Use SQL tests only as the database administrator in a controlled environment. Never commit an access token or an actual account/password. No real user session, email, camera device, operational backup or live delivery was exercised by these checks.

## Outstanding connected features

The demo's job editor, local invitation codes, evidence uploads and dossier exports have not been migrated to this API. Continue from this foundation with private immutable storage and verified uploads, secure invitation acceptance/renewal, MFA and review transactions, then released snapshots/receipts. Automatic regulatory decisions and automatic cross-document analysis remain outside the MVP.

## Verification record — 2026-10-19

Lint and TypeScript passed; 42 tests in eight Vitest files passed; all 20 Chromium scenarios passed. After the final API typing/formatting changes, the two focused connection/checkbox scenarios passed again. A clean dependency install and production build passed in an isolated local copy of the same source and lockfile (`ambientis-connected-build-1v9507xb`); this avoids the pre-existing duplicate-file behaviour in the iCloud dependency directory without deleting that directory. The build includes dynamic `/conexao` and `/api/v1/[resource]` routes.

The real Supabase rollback suite passed, the anonymous Data API returned 401, and the security advisor returned no lints. Performance advice is limited to unused indexes on the new empty schema ([Supabase unused-index guidance](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)). Real password sign-in remains unverified because there are no Auth accounts; it must be checked after the administrator provisions the first account.
