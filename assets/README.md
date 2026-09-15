# ChettaPay brand assets

Source of truth for the mark, the wordmark and the palette. The SDK inlines the
mark rather than fetching it, so **these files are upstream of shipped code**:
change one here and the corresponding literal has to be regenerated.

## Naming

**ChettaPay** is the product: the npm scope, the class names (`ChettaPayClient`),
the CSS prefix (`.chettapay-*`), the copyright line.

**Chetta** is the animal the mark is drawn from. It names the artwork files, the
palette tokens, and nothing else.

## Files

| File                     | Use                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `chetta-mark.svg`        | The mark. Gradient coat tile, 48x48 viewBox, scales to any size. The one the SDK inlines.                               |
| `chetta-mark-mono.svg`   | Single-color mark, `fill: currentColor`. For places that impose their own color.                                        |
| `chetta-mark.png`        | 256px raster, for contexts with no SVG renderer.                                                                        |
| `chetta-favicon.svg`     | Simplified mark: flat fill, spots and mouth dropped, heavier tear stripes. Detail that only muddies at 16px is removed. |
| `chetta-wordmark.svg`    | Mark plus "ChettaPay". README headers, docs chrome.                                                                     |
| `chetta-og.png`          | 1200x630 Open Graph card.                                                                                               |
| `chetta-brand-sheet.png` | The whole system on one page: mark at every shipping size, wordmark, favicon, palette.                                  |

## Palette

Named after the animal. The coat golds carry the brand; the neutral ramp is
warmed to sit with them, because a cool gray next to amber reads as a mismatch
rather than as a neutral.

| Token   | Hex       | Role                                                                                           |
| ------- | --------- | ---------------------------------------------------------------------------------------------- |
| `amber` | `#A2590D` | Default accent, light theme. White type on it clears WCAG AA (5.2:1).                          |
| `gold`  | `#E8A33D` | Default accent, dark theme (8.8:1 on sable, where amber manages 3.6:1). Mark's gradient start. |
| `sable` | `#17120E` | Dark surface.                                                                                  |
| `soot`  | `#2A211A` | Raised surface on dark: inputs, list rows.                                                     |
| `sand`  | `#FAF5EC` | Raised surface on light.                                                                       |
| `tint`  | `#FDF6EA` | Faintest amber wash, for callout rows on light.                                                |
| `bone`  | `#E8DECD` | Hairline on light.                                                                             |
| `bark`  | `#3D3128` | Hairline on dark.                                                                              |
| `ink`   | `#1B1409` | Body text on light.                                                                            |
| `cream` | `#FBF7F1` | Body text on dark.                                                                             |
| `clay`  | `#7A6A55` | Secondary text on light (5.2:1 on white).                                                      |
| `dune`  | `#B0A08A` | Secondary text on dark (7.4:1 on sable).                                                       |

Status colors (error, success, pending) stay semantic and are deliberately not
brand-tinted: a red that has been pulled toward amber stops reading as an error.

Two copies of the palette exist in code and must stay in lockstep:

- `packages/react/src/components/modal-theme.ts` - `CHETTA`, plus the CSS custom
  properties every web modal derives from it.
- `packages/react-native/src/theme.ts` - `CHETTA`, plus `defaultAccent()`.

Both are re-exported from their package's entry point so an application can
match its own chrome to the modals'.

## Accent resolution

Only the **default** accent follows the theme (amber on light, gold on dark). An
application that configured `styles.accentColor` gets that color in both themes -
someone else's brand color is not ours to swap out from under them.

## Regenerating the inlined mark

`packages/react/src/constants.ts` holds the mark as an SVG data URI and
`packages/react-native/src/constants.ts` holds it as a 128px PNG data URI (React
Native's `<Image>` has no SVG renderer). Neither is hand-edited. After changing
`chetta-mark.svg`, regenerate both:

```bash
node scripts/build-brand-assets.mjs
```

The URI is encoded so the literal drops into an `<img src>`, a CSS `url()` and an
XML attribute without further escaping - `<`, `>`, `"`, `#`, `&` and parentheses
are all percent-encoded. An unencoded `)` inside the SVG would terminate a bare
`url()` early.
