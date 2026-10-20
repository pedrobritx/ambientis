# ADR 0009 — Connected workspace foundation

- Date: 2026-10-19 (São Paulo)
- Status: additive schema applied to the user-selected Supabase project; application awaiting review

## Context

Pedro requested connecting the existing local application to `pedrobritx/ambientis`, the existing Ambientis Figma file and the supplied Supabase project. The original RTA workflow includes independent reporting periods, waste evidence reconciliation and water-resource processes. Its professional catalogue is not yet validated.

## Decision

Retain the local synthetic adapter and saved drafts. Add a separate `/conexao` screen and `/api/v1` resource API. Supabase Auth verifies user identity; Postgres grants, live organization membership, roles and explicit facility access authorize records. The API uses the user's bearer token and a publishable key, without service-role credentials. Browser sessions remain in memory; there is no cookie-authenticated API or public sign-up interface in this slice.

Create the small relational nucleus before extending technical modules: profiles, organizations, organization_members, companies, company_contacts, facilities, facility_access, processes, requirements, document_requests and audit_events. Every business relationship includes organization identity; references to processes and requirements also preserve facility identity. Contacts never implicitly grant access. Bootstrap creates one owner workspace atomically and returns that workspace on retries.

Owners manage directory records; assigned technical responsible/analyst members can manage work in authorized facilities. Other roles read assigned facilities. Clients only read explicitly shared requirements and sent requests; contacts and audit remain internal. No membership/permission administration endpoint is exposed yet. Infrastructure administrators must provision memberships/scopes deliberately until that workflow has its own MFA and invitation tests.

Editable records compare versions and reject identity reassignment. Application writes cannot replace authorship or timestamps, delete records, edit audit events, promote users or approve a final delivery. Audit stores operation metadata rather than document payloads. `sent` is a sharing state, not proof that an email was sent.

## Consequences and limits

This is the first connected foundation, not a cloud replacement of every demo feature. Private files, upload verification/hash/versioning, signed submissions, real invitations, MFA/independent review, dossier release and receipts need their own implementations. There are intentionally no cloud upload policies or final approval statuses. Do not use real client data until operational review, backup/restore, retention and the relevant workflows pass.

A manual first Supabase Auth account is required; no account, password or email was created/sent by the implementation. No demo records are copied to the cloud. The existing public proposal is not committed. The supplied publishable configuration lives only in ignored local environment settings; examples contain placeholders.

The repository already has automatic Vercel deployment integrations. A branch-specific `git.deploymentEnabled` rule suppresses automatic deployment of this review branch. Production branch behaviour is not reconfigured. Merge/deployment and provider settings remain separate decisions.

## Verification

Vitest executes the migrations against an embedded PostgreSQL runtime with synthetic Auth functions. SQL tests run in a rollback transaction on the selected Supabase project with `authenticated`/`anon` roles and synthetic claims. They check cross-organization and same-consultancy client isolation, sharing, forbidden writes, role escalation, foreign-key scope and immediate revocation. They do not establish a real end-user login, MFA or an independent penetration test.
