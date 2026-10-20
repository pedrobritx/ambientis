# Registry assistance, local invitations and delivery preview

Updated 2026-10-19. These changes extend the local review adapter. No deployment, real authentication, hosted persistence, email provider or private-data processing was introduced.

## Browser-comment coverage

| Comment                                            | Result                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1: predefined multi-select services                | Job setup offers several services, a custom title and initial checklist checkboxes. The chosen services are stored separately from the title.                                                                                                                                                             |
| 2: invited people create profiles                  | A clearly labelled local guest journey accepts a pending invitation, fixes the invited email, collects name/position/WhatsApp and enters that company's simulated client perspective. It works in the same browser store only.                                                                            |
| 3: contact action looks like a button              | Company cards give New job primary treatment and Add contact a bordered secondary button, alongside invitations and registration editing.                                                                                                                                                                 |
| 4: mobile navigation disappears during transitions | The complete fixed navigation has its own view-transition surface. Its new snapshot remains opaque; the mobile active item no longer detaches from the bar. Content keeps directional transitions and reduced-motion support; an 80 ms exit precedes the 220 ms entrance to avoid overlapping dense text. |
| 5: technical staff reset invitations               | Manage invitations is reachable from the team profile, each company and a job's invitation action. Renewing invalidates the preceding code; one-use codes expire after seven days.                                                                                                                        |
| 6: company identity distinct from industry         | Company registration stores CNPJ, declared sector, CNAE and optional address. Job setup separately confirms the activity and location of the actual facility. New company forms require a valid CNPJ; earlier records remain editable and readable.                                                       |
| 7: company and industry lookup                     | Optional BrasilAPI CNPJ lookup returns a reviewable proposal for legal name, primary/secondary CNAEs and corporate address. CNAE is never treated as proof of the activity or applicable environmental obligations.                                                                                       |
| 8: locality and CEP lookup                         | Explicit buttons query municipalities for GO/DF and look up a CEP. A CEP from another state cannot silently change the facility's selected jurisdiction. Manual entry remains available.                                                                                                                  |
| 9: select multiple requirements                    | A searchable operational catalogue supports multiple additions, detects existing entries, exposes contextual guidance and retains manual creation. Technical applicability remains pending review.                                                                                                        |
| 10: view before downloading                        | Preserved deliveries have Summary, Report PDF, Matrix and Evidence index views. The report is a native SVG preview generated from the PDF writer's shared line wrapping, coordinates and pagination. The spreadsheet preview uses the same sheet data as XLSX export. No download starts on preview.      |

## Provider boundary

The client calls fixed HTTPS BrasilAPI URLs only after an explicit lookup action:

- `cnpj/v1/{cnpj}`: legal name, main/secondary CNAEs and corporate address.
- `cep/v2/{cep}`: state, city, neighbourhood and street.
- `ibge/municipios/v1/{uf}`: municipality list for the explicitly selected GO/DF scope.

Only CNPJ, CEP or UF is sent. Credentials and referrers are omitted. Necessary response fields are validated; partner records, personal names, phone numbers and emails are not imported. CNPJ suggestions retain provider URL and lookup time. Users review before applying; changing an identifier cancels and discards the previous request. Timeouts, offline responses, malformed or mismatched payloads, 404, 429 and other failures preserve editable manual entry. No background polling, bulk discovery or account provisioning was added.

The CNPJ validator supports existing numeric identifiers and Receita Federal's alphanumeric format, including the ASCII-minus-48 check-digit algorithm. An unavailable lookup, including unsupported provider coverage, does not prevent manual registration. A stored nonempty CNPJ cannot be reassigned to a different legal entity; create another company instead. Duplicate nonempty CNPJs are rejected. Updating registration invalidates job scope/reviewer confirmation while previously released snapshots remain unchanged. New delivery snapshots retain their registration data; earlier snapshots do not acquire current CNPJ data retroactively.

The BrasilAPI catalogue does not supply an Ambientis environmental-obligation decision engine. The local requirement list is an operational aid with pending professional applicability. There is no claim of automatic legal coverage or a reviewed regulatory catalogue. Actual activity, jurisdiction, service, reporting period and evidence still need professional confirmation.

## Invitation boundary

Codes use a random UUID-derived 128-bit value and are scoped to a registered company/contact. Renewal invalidates the previous code and any other pending code for that contact. One local command updates profile fields and consumes the code together, with the adapter’s best-effort revision check. It records an audit event without the raw code. Cross-tab race safety is not asserted. The invitation email and company cannot be chosen by the guest. Old invitation records load as legacy records without inventing a valid code.

**These are not production credentials.** Codes, company data and all simulated roles share editable localStorage. There is no email-ownership proof, password, real session or server authorisation. A link from this demo cannot onboard someone on a different browser/device. Real invitations require the existing target Supabase Auth/server persistence architecture, tenant and company membership enforcement, server-side expiration/revocation/redemption, delivery and abuse controls, recovery, RLS tests and operational approval before private data. No such provider was activated here.

## Export and rendering decisions

The native embedded PDF approach triggered an unsolicited download in the tested browser. The final implementation uses a shared native vector render plan, retaining the existing PDF writer and dependencies. Report content, page count, wrapping and coordinates come from one layout routine. SVG text is escaped by React; imported markup is never executed. The preview uses the browser's Helvetica/Arial font rendering with PDF-derived line widths. It is a preview of this app's generated report, not a general renderer for uploaded PDF files.

Preview views read only the fixed delivery snapshot. They do not include working concerns, later uploads, changed requirements or current company registration. Matrix scroll regions remain keyboard-focusable; report pages have accessible descriptions. Downloads remain separate explicit actions.

## Compatibility and verification

The version-1 schema adds defaults for earlier company/job/delivery/invitation records. Commands normalise older in-memory data as well as stored drafts, including a preview already open during development updates. UI reads tolerate missing newly introduced registration fields. Saved work is not reset or overwritten to perform a migration. The mobile perspective control stays visible; only its text label is hidden on narrow screens.

Unit checks cover numeric/alpha CNPJ validation, provider validation and minimisation, offline/rate-limit/manual fallback, local invitation renewal/expiry/replay/role limits, catalogue deduplication, preserved snapshots and shared PDF pagination. Browser checks cover provider mocks and explicit apply, multiple services/requirements, local guest creation with company scoping, frozen delivery preview without downloads, mobile navigation and accessibility. Exact final check counts and environment constraints are in [local review evidence](../development/local-review.md).

Live spot checks on 2026-10-19 confirmed CEP and GO municipalities (246 entries), plus the public CNPJ example used in provider documentation. Responses were inspected for expected fields, not saved as client records. The in-app browser successfully populated the GO municipality chooser. An initial Python urllib request received 403; standard API/browser checks succeeded. Availability is not an SLA. Native Safari/Firefox, screen-reader and physical-device testing remain pending.

## Primary references

- [BrasilAPI documentation](https://brasilapi.com.br/docs)
- [CNPJ route implementation](https://github.com/BrasilAPI/BrasilAPI/blob/main/pages/api/cnpj/v1/%5Bcnpj%5D.js)
- [CEP v2 implementation](https://github.com/BrasilAPI/BrasilAPI/blob/main/pages/api/cep/v2/%5Bcep%5D.js)
- [Municipality route implementation](https://github.com/BrasilAPI/BrasilAPI/blob/main/pages/api/ibge/municipios/v1/%5Buf%5D.js)
- [Receita Federal CNPJ check-digit manual](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf)
