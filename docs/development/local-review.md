# Local review implementation

Updated 2026-10-19. Branch: `feat/local-review-workflow`, starting at `8899829`. This record concerns local work, not deployed or merged functionality. [ADR 0008](../adr/0008-local-review-slice.md) owns the scope decision.

## Reviewable outcome

The PT-BR application connects dashboard, company/job search, adaptive job setup, editable requirements, request/correction/acceptance, synthetic evidence, internal concerns, history and numbered dossier delivery. Notifications and invitations are local records only. Client acknowledgement is simulated and is not a regulatory receipt.

Switch the clearly labelled perspective selector to rehearse technical, client and reviewer views. Two fictional companies are seeded. The client view is filtered, but all perspectives share one editable browser store. It is unsuitable for private information.

`src/domain/workflow.ts` owns transitions and illustrative profile selection. `src/features/workspace` owns the review adapter and journey. `src/features/dossier` owns snapshot exports. `src/styles/forest.css` owns the local semantic palette; `src/components/ui` owns native primitives and icons. The adapter is replaceable; it does not redefine the operational schema.

## Design provenance and comparison

Meridian revision: `d16ad6136c141a390a9310bf547128b873fc8771`. Source authority is the original Start frame `7:2`, the original Grass palette now named Forest, and `design/meridian/living-environments.json`. Selected glyph paths come from `universal-symbols.json`; small utilities use the same grid/stroke. Manrope UI and Fraunces editorial headings are self-hosted through the pinned font packages and their OFL notices.

The generated dashboard concept was revised after Pedro requested Forest. The final browser screenshots and concept were visually inspected together. Both retain the two-column task hierarchy, continue action, attention list, jobs, updates and review guidance. Deliberate implementation differences: live status and action wording comes from state; the demonstration banner and perspective controls remain explicit; dense panels stay opaque; mobile uses a single column and bottom navigation. The task is guideline adoption, not a raster replica. The concept's stronger translucent decoration is not imported into evidence content. Dawn/Dusk initially follow the OS preference; the utility-bar button overrides it and saves a browser preference. Shared Meridian contracts and Figma were not changed.

## Local verification

The following passed on Node 24.21.0 / npm 11.19.0 after the registry, invitation and preview refinement:

| Check                               | Evidence                                                                                                                                                                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm ci`, `npm run build`           | Clean isolated install from the same lockfile and production build passed; see environment note below                                                                                                                                                                                                  |
| `npm audit`                         | Zero reported vulnerabilities across the installed dependency graph at verification time                                                                                                                                                                                                               |
| `npm run typecheck`, `npm run lint` | No type or lint failures                                                                                                                                                                                                                                                                               |
| `npm test`                          | 33 tests: permissions, review/version preservation, file integrity, multi-contact scoping, CNPJ validation, registry responses, local invitation lifecycle, catalogue, schema compatibility and shared PDF pagination                                                                                  |
| `npm run test:e2e`                  | 18 Chromium scenarios: complete request/review/export journey, editable scope, unsupported setup, Forest/accessibility/reflow, damaged drafts, scroll restoration, rounded-menu keyboard/hover/reduced motion, multi-contact companies, image originals, portable brand kit and appearance preferences |
| Export ZIP                          | Downloaded from the browser; original bytes and SHA-256 matched an independent calculation                                                                                                                                                                                                             |
| Accessibility                       | Axe A/AA checks on desktop/dashboard/job/delivery, Dusk, mobile and dialog; no violations in the exercised states; Escape/focus restoration and overflow checked                                                                                                                                       |

Axe success is not full WCAG certification. Human screen-reader, zoom, native Safari/Firefox, real multi-user concurrency and recovery checks remain pending. The in-app browser was used first to inspect the integrated UI and dialogs. Its screenshot capture omitted the fixed sidebar despite visible accessibility nodes and a visible, correctly positioned DOM element; final visual comparison therefore used the automated Chromium screenshots. Native Safari/Firefox rendering is not attested by this review. No independent software/security review or professional technical approval is claimed.

The downloaded report was also read with pypdf and visually inspected after rasterising it; the three-sheet XLSX was independently opened with openpyxl. The repository includes a secret-free GitHub Actions workflow, but remote CI has not run. ESLint 9 is retained for the accessibility plugin's current declared peer compatibility; npm reports its support deprecation. This is a development-tool maintenance item, not a clean-audit guarantee of safety.

## Identity and interaction refinement

The [brand and interaction record](../product/brand-and-interactions.md) maps all ten browser comments to implementation, records the identity proposal, accessible selector/motion behaviour, company contacts, image support and remaining boundaries. Source artwork and the portable brand kit are in `public/brand/`; screenshots include the final board, branded dashboard, rounded menu, contacts and mobile upload.

The brand guide, board, open listbox and multi-contact dialog also passed automated accessibility checks. Browser tests exercise actual ZIP download, 13 icon entries, included font licence, outlined wordmark and original PNG byte preservation. Desktop/Dusk/mobile screenshots and the identity board were visually inspected. Physical camera capture, screen-reader testing and native Safari/Firefox remain unverified.

A build in the iCloud-backed checkout stalled during compilation with duplicate dependency files open; its cause was not established. It was terminated without deleting dependencies. A separate copy at `/Users/pedro/.codex/tmp/ambientis-branding-build-ixfd73h9` installed the same lockfile and completed the normal Turbopack production build (2.4-second compilation). No framework, bundler configuration or running preview was replaced. The exact generated duplicate declaration exclusion is documented in the refinement record. This distinguishes verified source portability from the remaining dependency-folder issue in this checkout.

## Limits and next useful work

The app generates an organisation/index report, not specialist inventories, RAPP calculations or regulatory submissions. PDF text supports Portuguese Latin characters; other scripts are outside this template. The simple XLSX export has no formulas or macros. Files are not malware-scanned. Browser drafts are best-effort; corrupted stored data is retained without overwriting it, and storage failure switches to an explicitly unsaved session. Unsaved form fields are not durable drafts.

Next, let the responsible professional perform the journey in Portuguese and validate the scope, checklist terminology, evidence associations, review reasons and delivered dossier. Then implement authenticated persistence and test real isolation before client information enters the app. Agree retention/access/processing terms, eligible hosting, whole-file backups and restoration, external signing validation, email reliability and professional release gates before operational use. See [operating considerations](../operations/initial-operating-considerations.md).

Docker was present but its daemon was unavailable during this work. Supabase local services, migrations, RLS tests and hosted providers were not implemented or run. No issue/milestone is marked complete by this record. No application changes were committed, pushed or deployed.

### Manual appearance selection

The Dawn/Dusk utility-bar control was verified against opposite OS preferences, reload persistence, route changes, keyboard activation, 320/390 px reflow, logo variants and blocked preference writes. All 12 Chromium scenarios, 22 unit tests, lint and type checking passed. The updated application also built successfully in the existing isolated clean installation. Accessibility checks wait for colour transitions to settle before evaluating contrast. The running in-app preview was inspected; the screenshot is `outputs/ambientis-appearance-toggle.png` in the chat workspace.

## Registry, invitations and preview verification

The [implementation record](../product/registry-invitations-preview.md) maps the latest ten comments to concrete behaviour and provider/authentication boundaries. The final run passed 33 unit checks, 18 Chromium scenarios, lint and type checking. The updated source compiled with the same lockfile in the existing clean isolated build copy. Live public CNPJ/CEP/municipality spot checks succeeded; the in-app GO municipality chooser populated successfully. No provider configuration or external account was created.

The existing in-app draft (four jobs including the two user-created examples and the 20:22 intermediate delivery) was preserved while the new form and delivery preview were exercised. An older in-memory company shape initially exposed a missing-field exception during development; input normalisation and defensive reads were added and tested before reloading the preview. The report's vector preview and matrix were inspected without initiating any download. Screenshots cover registry fields, catalogue choices, local guest profile, stable mobile navigation and the preserved delivery.

The native PDF embed was replaced after a browser test observed an automatic download. The shipped preview uses the shared PDF layout plan and native SVG, with no added dependency. It previews this generated report; it does not render arbitrary uploaded PDFs. Invitation links remain same-browser rehearsals, without verified identity or server security. Operational authentication and private-data gates remain pending.
