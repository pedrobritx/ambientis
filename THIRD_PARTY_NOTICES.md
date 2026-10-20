# Font and design provenance

- Manrope and Fraunces are self-hosted through the pinned `@fontsource/manrope` and `@fontsource/fraunces` packages. Their SIL Open Font License files are retained in those installed packages and copied alongside the distributed font files in `public/brand/fonts/`; the application does not request fonts from a remote CDN.
- The local Forest palette and selected semantic icon paths are adapted from Pedro's Meridian source at `d16ad6136c141a390a9310bf547128b873fc8771` for the intended Ambientis project. Meridian is not incorporated as a published dependency. Its repository does not grant a general redistribution licence; confirm rights before distributing its source beyond the intended projects.
- Other packages retain their licences in the installed dependency tree. The lockfile records the exact packages used.

Design scope and sources are recorded in [ADR 0008](docs/adr/0008-local-review-slice.md).

The Ambientis symbol is original vector artwork. The outlined wordmark uses the pinned Manrope font. The brand kit includes selected Meridian glyphs for this intended project and utility glyphs drawn in that language; the same Meridian redistribution boundary applies. It is a review proposal, not a cleared or registered trademark.
