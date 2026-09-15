#!/usr/bin/env node
// Regenerates the brand literals that the SDK ships inline, from the artwork in
// `assets/`. Run it after changing `assets/chetta-mark.svg`; never hand-edit the
// `LOGO_CHETTAPAY` literals it writes.
//
// The rasters it consumes (`chetta-mark-128.png`, `chetta-mark.png`,
// `chetta-og.png`) are rendered from the SVG with a headless browser rather than
// here, so this script stays dependency-free:
//
//   google-chrome --headless --screenshot=out.png --window-size=128,128 \
//     --default-background-color=00000000 page-with-the-svg.html
//
// Usage: node scripts/build-brand-assets.mjs [--check]

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

/** Percent-encode everything that would need escaping in an `<img src>`, a CSS
 *  `url()` or an XML attribute. A bare `)` inside the SVG would otherwise
 *  terminate an unquoted `url()` early. */
function svgDataUri(svg) {
  const compact = svg
    .replace(/<title>.*?<\/title>/gs, '')
    .replace(/\s+role="img"\s+aria-label="Chetta"/g, '')
    .replace(/>\s+</g, '><')
    .trim();
  const encoded = compact.replace(
    /[^A-Za-z0-9/:=?[\]@!$*+,;\-._~]/g,
    (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'),
  );
  return `data:image/svg+xml,${encoded}`;
}

/** Swap the `LOGO_CHETTAPAY` literal's VALUE, leaving the surrounding formatting
 *  alone. The assignment is longer than Prettier's print width, so Prettier
 *  wraps the string onto its own line - matching the value rather than the whole
 *  statement keeps this script agreeing with whatever shape Prettier settled on,
 *  instead of reporting a formatted file as stale forever. */
const LOGO_RE = /(export const LOGO_CHETTAPAY =\s*')([^']*)(';)/;

function writeLogo(relPath, uri) {
  const file = join(root, relPath);
  const before = readFileSync(file, 'utf8');
  const match = before.match(LOGO_RE);
  if (!match) throw new Error(`no LOGO_CHETTAPAY literal found in ${relPath}`);
  if (match[2] === uri) return false; // already current
  if (!check) writeFileSync(file, before.replace(LOGO_RE, `$1${uri}$3`));
  return true; // stale
}

const webUri = svgDataUri(readFileSync(join(root, 'assets/chetta-mark.svg'), 'utf8'));
const rnUri = `data:image/png;base64,${readFileSync(join(root, 'assets/chetta-mark-128.png')).toString('base64')}`;

const stale = [
  writeLogo('packages/react/src/constants.ts', webUri) && 'packages/react/src/constants.ts',
  writeLogo('packages/react-native/src/constants.ts', rnUri) && 'packages/react-native/src/constants.ts',
].filter(Boolean);

if (check) {
  if (stale.length) {
    console.error(`Brand literals are stale, run: node scripts/build-brand-assets.mjs\n  ${stale.join('\n  ')}`);
    process.exit(1);
  }
  console.log('Brand literals are up to date.');
} else {
  console.log(stale.length ? `Updated:\n  ${stale.join('\n  ')}` : 'Brand literals already up to date.');
}
