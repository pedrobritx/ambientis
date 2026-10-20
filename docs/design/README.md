# Ambientis design source and traceability

Use the [existing Ambientis Figma file](https://www.figma.com/design/vBnUoTa4UtWZ3t3f0EikMk/Ambientis), updated in place. The original empty Page 1 remains intact.

| Page / node | Contents |
|---|---|
| 01 · Identidade e componentes / 14:44 | Native logo, Manrope typography, Forest Dawn/Dusk palette specimens, primary/secondary buttons with default/hover/pressed/disabled review instances |
| 02 · Fluxos e decisões de dados / 15:2 | Work-to-dossier journey with implemented versus future connected steps |
| 02 · Fluxos e decisões de dados / 15:57 | Session → live membership → facility → operation → identity/revision → transactional audit decision flow |
| 02 · Fluxos e decisões de dados / 15:118 | Eleven-table relational model and future evidence/release boundaries |
| 03 · Interface de revisão / 17:49 | Editable desktop dashboard composition reference |
| 03 · Interface de revisão / 17:131 | Mobile requirement picker with checkbox beside its title |
| 03 · Interface de revisão | Thirteen original SVG icon components and a reusable requirement-choice component |

The file has 59 variables across Ambientis / Primitives, Ambientis / Forest (Dawn/Dusk) and Ambientis / Metrics; five text styles plus a rest-elevation style. Colour roles alias primitives, and code syntax uses the actual CSS custom properties. Timing variables use seconds in Figma and point to the millisecond CSS values. Their API does not permit setting visual scopes. UI text is Manrope; Fraunces remains the editorial brand typeface.

These are native editable layers, component instances and vectors, with no flattened UI screenshot fills. References guide implementation; they do not claim pixel-identical capture or a complete interactive prototype. Shared Meridian sources were read for discovery and preserved; the product records its Forest adoption and source revision. This does not publish a new shared Meridian library.

Code sources: `src/brand/identity.json`, `src/brand/design-tokens.json`, `src/styles/foundations.css`, `src/styles/forest.css`, `src/styles/interactions.css` and `public/brand/`. [figma-ledger.json](figma-ledger.json) retains node/variable/style IDs returned by construction for later in-place changes.

The browser checkbox fix uses a two-column grid with a flexible text column. Secondary text actions have a visible border, surface, padding and elevation at rest, while the primary action retains stronger emphasis.
