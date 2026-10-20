# Issue acceptance audit — 2026-10-20

Scope: all 23 open issues in `pedrobritx/ambientis`, inspected after merged PR #26 (`6a9f9e7`). Existing demonstrations count only for the behaviour they actually implement. Closure requires every issue criterion and its recorded verification; remaining professional, financial and operational gates are preserved.

| Issue | Evidence or concrete remaining work | Disposition |
|---|---|---|
| #1 GOV-01 | Foundation/manual merged; Rafaela's technical review and accepted scope still pending. | Keep open |
| #2 GOV-02 | Project #12 inspected: 23 issues, correct classifications, M0–M7 without invented dates. All eight operational views added while preserving the three existing views. Overview/roadmap group by Phase, execution/backlog sort by Priority, date fields reuse existing empty fields. Eight native workflows include reopened → Todo. Both verified CI checks are required; PRs, resolved conversations and up-to-date branches are enforced, force-push/deletion blocked, with zero mandatory outside approvals. | Closure candidate after evidence read-back |
| #3 OPS-01 | Vercel links exist; plan eligibility, approved operating limit and isolated previews need confirmation. | Keep open |
| #4 APP-01 | Pinned app/commands/CI plus local CLI, migrated synthetic seed and clean-checkout validation in this change. | Closed by #27; fresh-stack correction and evidence in #28 |
| #5 UX-01 | Forest Dawn/Dusk supersedes the original Terra reference; mobile/keyboard tests exist. Full screen-reader, session/failure and complete navigation acceptance remain. | Keep open; preserve the accepted Forest direction |
| #6 AUTH-01 | Verified sign-in/logout exists. Recovery, first access, MFA and AAL2-sensitive operations remain. | Keep open |
| #7 DB-01 | Versioned RLS/grants/composite keys/audit plus real Auth, direct PostgREST and Next API tests. Final approval is deliberately unavailable, including direct UPDATE. | Closed by #27 for the nucleus; #28 supplies fresh-stack correction; #6 remains open |
| #8 BASE-01 | Company/contact/facility nucleus exists; activity/license inventory, archive workflow and full master-data criteria remain. | Keep open |
| #9 DOC-01 | No connected private Storage/upload verification, resumability or tenant-safe signed downloads. | Keep open |
| #10 PROC-01 | Initial process/requirement API exists; yearly checklist versions, assignments and transactional workflow are incomplete. | Keep open |
| #11 WASTE-01 | Decimal waste inventory/balance engine and unit/period rules are absent. | Keep open |
| #12 WASTE-02 | Many-to-many MTR/CDF/NF reconciliation and professional rule review are absent. | Keep open |
| #13 DOS-01 | Generic demonstration exports do not prove a complete waste inventory dossier with manifest integrity. | Keep open |
| #14 RAPP-01 | Versioned annual reporting rules, source calculations, reconciliation and professional validation remain. | Keep open |
| #15 WATER-01 | Water-point/rule/calculation workflow and professional validation remain. | Keep open |
| #16 FIELD-01 | Demo camera/file choices are not resumable connected field capture; real-device/interruption tests remain. | Keep open |
| #17 OFF-01 | Browser draft persistence is not an IndexedDB outbox with idempotency, revocation and conflict recovery. | Keep open |
| #18 QA-01 | No complete A–G gates, independent QA-F, AAL2 approval or approval invalidation workflow. | Keep open |
| #19 DOS-02 | Frozen local demo exports are not immutable connected release snapshots, protocol receipts or export recovery. | Keep open |
| #20 OPS-02 | No verified external backup/restore or approved RPO/RTO/retention/cost. | Keep open |
| #21 SEC-01 | Nucleus isolation now tested; Storage/AAL2, recovery/incident procedures and complete security acceptance remain. | Keep open |
| #22 PILOT-01 | Requires Rafaela's real journey acceptance plus operational and accessibility gates. | Keep open |
| #23 LATER-01 | Post-pilot prioritisation needs observed pilot results; optional automation remains deferred. | Keep open |

## Dependency interpretation

The professional review in #1 and full authentication lifecycle in #6 remain gates for operational release. They do not prevent testing the executable foundation and database nucleus with synthetic accounts. Closing #4/#7 does not close those dependencies, approve environmental rules or permit real client data. Final QA approval cannot be directly updated because the schema exposes no such state; the positive approval workflow belongs to #18.

## Verification record

The PR records clean-install, SQL, real API, unit, browser and build results and CI URLs. Do not infer deployment or professional acceptance from them. The narrow local-mode option is covered by configuration tests that reject production, Vercel, non-loopback URLs, secret keys and missing opt-in.

## Current acceptance evidence

- PR #27 merged; #4 and #7 closed by its closing references. Its first fresh CI run exposed disabled email-provider login, so that run is **not** acceptance evidence.
- Follow-up #28 keeps the email provider enabled while global signup stays disabled. GitHub Actions run [39423193437](https://github.com/pedrobritx/ambientis/actions/runs/39423193437) passes both `local-review` and `database-api` on `3bd713b`: clean checkout, `npm ci`, migrations/seed, rollback SQL, six real API scenarios, 51 unit tests, 20 Chromium scenarios and build.
- A seventh API scenario subsequently verifies that signup remains disabled while seeded login works. Its current-head CI result must be recorded in the PR before merge.
- Project #12 read-back verifies eleven views (three preserved plus eight operational), eight enabled workflows and correctly classified #1 (M0/docs/P0) and #11 (M3/waste/P0), both Todo. Native milestones M0–M7 have no dates. Issues #1/#3 carry the `blocked` label for professional-review and budget/eligibility decisions; no other issue is marked Done on partial evidence.
- Main protection reads back `local-review` and `database-api` from GitHub Actions app 15368 with strict checks, required PR/conversation resolution and blocked force-push/deletion. Zero mandatory outside approvals avoids locking the sole contributor out of ordinary merges.
