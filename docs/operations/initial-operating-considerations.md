# Initial operating considerations

Planning reference checked on 2026-10-19. No accounts, plans, regions or contracts were configured or approved by this work. The current app runs locally with synthetic data and has no provider charges.

## Storage and confidentiality

For the first real internal pilot, retain the planned Next.js/Supabase stack and use private buckets plus authenticated, scope-checked download paths. Enforce company/unit membership on the server and in database/storage policies. Test direct access using known IDs from another company. A public repository must never contain client files, credentials or private proposals.

Database recovery must include file recovery: [Supabase's backup documentation](https://supabase.com/docs/guides/platform/backups) states that database backups exclude Storage objects. Plan a separate recoverable copy of originals and released packages, a manifest, and an actual restore exercise. The current local ZIP is a deliverable, not a complete database backup.

## Cost and eligibility

| Service  | Current reference                                                                                                                                                                                    | Decision before real use                                                                                                                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase | Free includes 500 MB database and 1 GB files; no automatic backups and may pause after a week of inactivity. Pro starts at USD 25/month, including compute credits sufficient for one Micro project. | Select region, expected file volume, recovery requirements and budget; confirm actual checkout costs and any taxes/add-ons. [Pricing](https://supabase.com/pricing)                                                                       |
| Vercel   | Hobby is restricted to personal, non-commercial use.                                                                                                                                                 | Supporting paid consultancy is a reason to check commercial eligibility even if Ambientis itself is not sold. Do not assume a hobby exemption. [Hobby terms](https://vercel.com/docs/plans/hobby)                                         |
| Resend   | Free advertises 3,000 emails/month with a 100/day limit.                                                                                                                                             | Verify a sending domain; keep emails to invitations/reminders/delivery notices with private app links. Implement retries, duplicate suppression and delivery/bounce handling before enabling sends. [Pricing](https://resend.com/pricing) |

These are reference limits, not a purchasing recommendation or a promise of a fixed total. Existing provider subscriptions have not been inspected. Keep the synthetic local review until a small operating budget and service eligibility are approved; no scaling infrastructure or extra backend is needed for this stage.

## Personal data and professional responsibilities

The LGPD's personal-use exclusion refers to exclusively private, non-economic processing by a natural person. Treating an internal tool that supports paid consultancy as automatically exempt would be an unsafe inference. When documents contain personal data, determine purpose, lawful basis, controller/operator roles, access, retention, deletion exceptions and response responsibilities. Retention should reflect the applicable record and engagement; do not invent one universal duration. Articles 4, 6, 7, 15–16, 33 and 46 provide the starting questions. [LGPD, official text](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).

A provider's security features do not settle those decisions. Confirm processing terms and any international-transfer arrangements for the actual providers, regions and support access. Get Brazilian legal review of the engagement terms, submission declaration and retention choices before relying on them for protection. Signed submissions support provenance; they do not certify the facts or remove the professional's review duties. Hospital examples should use environmental records without patient data in the initial scope.

The responsible professional owns technical content and approval; Pedro runs software operations with appropriate access. This allocation needs to be reflected in actual permissions and contracts, not just UI labels. No lawyer has reviewed this planning note.
