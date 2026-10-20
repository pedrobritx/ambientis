# Ambientis identity and interaction refinement

Updated 2026-10-19. The identity is proposal 0.1 for Pedro's review, using Meridian Forest. It is applied to the local synthetic-data application; it does not imply trademark clearance, professional approval or a production release.

## Identity and portable files

`src/brand/identity.json` is the canonical original mark, palette and typography record. The symbol is an open, organic lowercase “a”; the wordmark uses outlined Manrope 700 glyphs. Manrope is the UI family and Fraunces the editorial family. Forest/reverse/black/white SVG and transparent PNG exports, adaptive lockup, app icons, 13 semantic SVG icons, contour pattern, demonstration dossier cover, email-signature HTML, font files and licences live in `public/brand/`.

Open `/brand/index.html` for the Portuguese usage guide and `/brand/ambientis-brand-board.html` for the board. The downloadable ZIP is a portable folder: extract it and open `index.html`. The kit's SVG wordmarks do not require installed fonts. The cover is an identity example, not an implemented specialist report template. The HTML signature is a local example; no message is sent.

Optional authoring: install `fonttools[woff]` in an isolated Python environment, then run `scripts/build-brand-assets.py`. Run `node scripts/render-brand-assets.mjs` with the installed project dependencies to export PNGs/fonts/icons. Run `npm run brand:package` to create the portable ZIP after refreshing the board PNG. These tools are not runtime or application build dependencies. The final brand board PNG is a browser rendering of the native HTML/SVG assets. An AI-generated concept board informed the initial direction; it is not the canonical vector artwork.

Meridian source authority remains `d16ad6136c141a390a9310bf547128b873fc8771`, original Grass/Start/Forest and stable motion tokens. Shared Meridian/Figma sources were not modified. See [third-party notices](../../THIRD_PARTY_NOTICES.md) and the included font licences.

## Browser feedback coverage

| Pedro's comment                                     | Implemented response                                                                                                                                                                                                                        |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1: dropdown indicator spacing                       | A separate chevron slot, 14 px gap and 12 px horizontal inset in the perspective trigger; form triggers use 16 px gap and 14 px inset.                                                                                                      |
| 2: square option menu                               | Product-local rounded native popover/listbox; 24 px desktop and 20 px mobile corners, selected indication and scrollable options.                                                                                                           |
| 3–4: consistent states and smooth hover             | Rest/hover/pressed/selected/focus states on controls and navigable rows; no sudden row translation; surface and depth changes use easing. The continue panel raises subtly on hover/focus; its labelled action remains the link.            |
| 5: liquid local interactions and logical navigation | Menu scale/opacity/contour opening, dialog expansion from the opener, eased dismissal and directional content transitions. Browser-native fallbacks preserve navigation.                                                                    |
| 6: profile differs from sidebar                     | Profile and navigation share padding, rounded hover/pressed treatment and selected/expanded distinction.                                                                                                                                    |
| 7: native file button                               | Styled, labelled actions invoke native pickers; unstyled OS file-input controls are visually hidden.                                                                                                                                        |
| 8: mobile file/photos/camera                        | Separate file, image-library and rear-camera capture inputs; validated JPEG/PNG/WebP/HEIC/HEIF originals alongside PDF/TXT. Actual camera behaviour still needs a real device check.                                                        |
| 9: inconsistent depth                               | Shared restrained resting/raised elevation on surfaces, row groups, inputs, popovers and upload area.                                                                                                                                       |
| 10: several company contacts                        | Company directory registers a company with one or more contacts and adds further contacts. Each has name, optional position/WhatsApp, and required unique email within that company. Demo perspectives are scoped to the contact's company. |

| State          | Behaviour                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| Rest           | Stable surface and legible border; depth expresses hierarchy.                                                        |
| Hover          | 140 ms colour/surface easing; 220 ms depth easing.                                                                   |
| Pressed        | 80 ms contact; inset depth and at most 0.99 scale.                                                                   |
| Selected       | Persistent semantic state, not hover: current navigation, selected requirement, selected option or expanded profile. |
| Keyboard focus | Separate visible focus ring; Escape closes the menu, then the enclosing dialog.                                      |
| Local overlay  | Up to 320 ms expansion, 220 ms release; no route change.                                                             |
| Route change   | Main-content transition with forward/back direction; repeated fast navigation skips decoration safely.               |
| Reduced motion | No positional animation or press scaling; navigation and menus remain functional.                                    |

The selector retains native popover dismissal, supports arrows, Home/End, typeahead, Enter/Space, Escape and Tab, and restores its trigger's focus. Native dialogs retain modal focus containment. Top controls and complementary regions have labelled landmarks. Automated checks do not replace screen-reader and native Safari/Firefox testing.

## Data and compatibility boundary

Earlier version-1 drafts without a company catalogue receive the two seed companies on validation, preserving jobs, revision and history. New companies/contacts remain local browser data. Contact perspectives rehearse access; adding an email does not create an account, invite anyone, verify ownership or provide server isolation. No external services were provisioned.

Original file bytes and SHA-256 are preserved. File signatures and extensions must agree. Limits remain 1 MiB per file and 2 MiB total in the browser, so large phone photos are rejected explicitly; they are not silently recompressed. No malware scanning, resumable cloud upload or real multi-user storage is claimed. Reviewers cannot upload. Use only fictional contacts and images during this evaluation.

A generated `.next/types/routes.d 2.ts` copy caused a duplicate declaration during local checking. The exact copy is excluded by TypeScript; it remains on disk. This is an environment workaround, not a change to Next's routing or an explanation of how the duplicate originated.

[Current verification](../development/local-review.md) and [operating gates](../operations/initial-operating-considerations.md) remain authoritative.
