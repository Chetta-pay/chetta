// Injected at build time by tsup (`define`) from `package.json#version`.
// `declare` so TypeScript knows the identifier; at runtime it is either
// replaced with a string literal (bundled builds) or absent (running the
// source unbundled - ts-node, vitest), which the `typeof` guard below handles.
declare const __CHETTAPAY_SDK_VERSION__: string;

/**
 * Version of this `@chettapay/core` build (e.g. `'0.8.2'`). Falls back to `'dev'`
 * when running unbundled.
 *
 * Named per-package on purpose: importing it alongside `@chettapay/react`'s
 * `CHETTAPAY_REACT_VERSION` never collides, so an app can report both versions in
 * a single bug-report / diagnostics line.
 */
export const CHETTAPAY_CORE_VERSION: string =
  typeof __CHETTAPAY_SDK_VERSION__ !== 'undefined' ? __CHETTAPAY_SDK_VERSION__ : 'dev';
