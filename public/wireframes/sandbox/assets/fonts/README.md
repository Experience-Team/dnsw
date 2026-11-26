# Fonts for the high fidelity prototypes

**Stand-ins.** The Third Half brand faces are Social Mono and Social Condensed (Landor). They aren't licensed yet, so,
as in the Figma guidelines (Rugby World Cup file, Styling page, node 261:13292), IBM Plex stands in:

| File | Face | Used for |
|---|---|---|
| `ibm-plex-sans-condensed-latin-400-normal.woff2` | IBM Plex Sans Condensed Regular | Body copy, captions, meta (TTH Tertiary Condensed) |
| `ibm-plex-sans-condensed-latin-600-normal.woff2` | IBM Plex Sans Condensed SemiBold | Headings and buttons (TTH Secondary Condensed) |
| `ibm-plex-sans-condensed-latin-700-normal.woff2` | IBM Plex Sans Condensed Bold | Emphasis in body |
| `ibm-plex-mono-latin-700-normal.woff2` | IBM Plex Mono Bold | Team codes and short caps labels (TTH Primary Mono) |

Latin subset only, from `@fontsource/ibm-plex-sans-condensed` and `@fontsource/ibm-plex-mono` 5.3.0. Licensed under the
SIL Open Font License 1.1 (`OFL.txt`), which allows self-hosting.

**Swapping in the brand fonts:** add the licensed web font files here and an `@font-face` for each in
`themes/hifi.css` named `Social Condensed` and `Social Mono`. The font stacks already list those names first, so they
take over with no other change.
