/** The Chetta palette, mirroring `@chettapay/react`'s `CHETTA` so a phone and a
 *  browser showing the same account render the same brand. Keep the two in
 *  lockstep: the web copy lives in `packages/react/src/components/modal-theme.ts`.
 *
 *  Named after the animal the mark is drawn from. The coat golds carry the
 *  brand and the neutral ramp is warmed to sit with them - a cool gray next to
 *  amber reads as a mismatch rather than a neutral. */
export const CHETTA = {
  /** Coat gold, deepened until white type clears WCAG AA on it (5.2:1). The
   *  default accent in light theme and the mark's own gradient end. */
  amber: '#A2590D',
  /** The lighter coat gold. Default accent in dark theme, where the amber is
   *  too close to the sable ground to read (8.8:1 against it, versus 3.6:1). */
  gold: '#E8A33D',
  /** Spot black, the dark surface. */
  sable: '#17120E',
  /** Raised surface in dark theme (inputs, list rows). */
  soot: '#2A211A',
  /** Underbelly cream, the light theme's raised surface. */
  sand: '#FAF5EC',
  /** The faintest amber wash, for callout rows on light. */
  tint: '#FDF6EA',
  /** Hairline on light. */
  bone: '#E8DECD',
  /** Hairline on dark. */
  bark: '#3D3128',
  /** Body text on light. */
  ink: '#1B1409',
  /** Body text on dark. */
  cream: '#FBF7F1',
  /** Secondary text on light. */
  clay: '#7A6A55',
  /** Secondary text on dark. */
  dune: '#B0A08A',
} as const;

/** The accent to use when the app configured none. Only the DEFAULT follows the
 *  theme: an app that set an accent gets that accent in both, since the brand's
 *  own color is not ours to swap. */
export function defaultAccent(theme: string | undefined): string {
  return theme === 'dark' ? CHETTA.gold : CHETTA.amber;
}
