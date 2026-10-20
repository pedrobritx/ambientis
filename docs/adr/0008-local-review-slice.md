# ADR 0008 — Local review workflow and Meridian Forest

- Date: 2026-10-19
- Status: Implemented locally for product review; operational use is not approved.
- Decision owner: Pedro. Technical content and professional acceptance await the responsible professional.

## Context

Pedro authorised a reviewable implementation before the responsible professional's availability. The repository previously contained the construction manual and planning records. The immediate outcome is a coherent company request, technical review and dossier journey, using fictional examples. This precedes the larger inventory and regulatory calculation milestones; it does not complete them.

## Decision

Retain Next.js App Router and TypeScript. Use a small browser-only review adapter with explicit simulated perspectives, Zod-validated local state, revision checks and pure domain commands. No account, server database, storage bucket, external email or signing provider is configured. Native HTML forms and dialog provide the initial interaction primitives; Tailwind, Radix and a form library can be added only when a concrete need warrants them.

Start with illustrative industrial gases/GO and hospital/DF profiles. Unknown water use remains a question. Other combinations create an empty manual checklist and cannot claim supported coverage. The technical user can add, edit, exclude with a reason and restore requirements. Catalogue content remains unvalidated.

Keep submissions separate from review. Preserve each response and review reason. Guided review means short contextual prompts and manual internal concerns, not automated inference about intent or hidden information. The submission confirmation checkbox rehearses the interaction; it is never presented as an electronic signature.

Freeze a numbered delivery snapshot. Export a delivery report PDF, an XLSX requirement matrix/evidence index, exact reviewed original files and a hash manifest in a ZIP. Include only files linked to the latest accepted response for a requirement. Working concerns stay outside client exports. Final simulated releases require complete/excluded requirements, scope review, a separate simulated reviewer and resolved concerns. These controls do not establish real independent professional review. Client acknowledgement is separate from regulatory receipt.

Pedro explicitly selected **Meridian Forest** as the visual guideline. Adopt the original Start/Grass/Forest language, Dawn/Dusk semantic colours, organic contours, restrained depth, readable opaque evidence surfaces and semantic icons. Do not adopt rejected Forest Concept B, photorealistic glass or experimental Lab behaviour. Preserve earlier Terra discussion as history; Forest is the current local implementation direction.

The subsequent [identity and interaction refinement](../product/brand-and-interactions.md) adds a proposal Ambientis mark, rounded accessible selectors, stable Meridian motion, native mobile capture entry points and a local multi-contact company catalogue. It preserves the same synthetic-data and simulated-access boundary.

## Consequences and alternatives

This gives the professional concrete tasks to evaluate without provisioning services or exposing client data. Browser data is editable by its owner and every persona shares it: filtering and command permissions are a rehearsal seam, not tenant isolation, authentication, tamper resistance or server audit evidence. Local storage is not an approved client archive or backup. Upload limits are deliberately small: PDF/TXT and validated JPEG/PNG/WebP/HEIC/HEIF images, 1 MiB each and 2 MiB total.

Do not promote this adapter into production. The existing Supabase/PostgreSQL/private Storage architecture remains the operational target. Replace browser persistence with authenticated server operations, RLS/constraints, private file access and durable audit/version records before real data. Backend work must test two client companies inside one consultancy as well as separate organisations. Domain and dossier modules can be retained behind those boundaries.

Hosted services would add cost and data-processing decisions before validating the workflow. A throwaway static mock would omit the evidence and export transitions that the review needs. The chosen local slice exercises those transitions while making its limits visible.

## Sources and validation

- [Current local review record](../development/local-review.md): commands, evidence, design provenance and outstanding gates.
- [Meridian Start](https://www.figma.com/design/aJ2f6aYX9KBucAdPsCmkXn/Meridian?node-id=7-2), read-only visual reference.
- [Meridian source at d16ad6136c14](https://github.com/pedrobritx/meridian/tree/d16ad6136c141a390a9310bf547128b873fc8771): living-environments.json, universal-symbols.json, stable tokens and the 2026-10-09 reorganisation contract.

No private proposal or client document is included in this repository. No merge, deployment, external configuration or professional approval follows from local checks.

## Local review extension — registry and onboarding

[Registry, invitations and delivery preview](../product/registry-invitations-preview.md) records the subsequent browser feedback. Explicit public-registry fetches are now available without credentials. They do not import contacts or determine environmental applicability. Same-browser invitation codes and guest profiles rehearse onboarding; server authentication, persistent access, email and provider provisioning remain unimplemented. New snapshot registration fields use defaults for earlier deliveries without filling them from live company data. The report preview and PDF share one render plan; no PDF-viewer dependency was added.
