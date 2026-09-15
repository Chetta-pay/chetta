import type { CSSProperties } from 'react';
import type { ChettaPayStyles } from '../types';

/** The Chetta palette. Named after the animal the mark is drawn from: the coat
 *  golds carry the brand, and the neutral ramp is warmed to sit with them -
 *  a cool gray next to amber reads as a mismatch rather than a neutral. */
export const CHETTA = {
  /** Coat gold, deepened until white type clears WCAG AA on it (5.2:1). The
   *  default accent in light theme and the mark's own gradient end. */
  amber: '#A2590D',
  /** The lighter coat gold. Default accent in dark theme, where the amber is
   *  too close to the sable ground to read (8.8:1 against it, versus 3.6:1). */
  gold: '#E8A33D',
  /** Spot black, the dark surface. */
  sable: '#17120E',
  /** Raised surface in dark theme (inputs, filled secondary buttons). */
  soot: '#2A211A',
  /** Underbelly cream, the light theme's raised surface. */
  sand: '#FAF5EC',
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

/** Per-app overrides for the modal chrome, configured in the dashboard's
 *  Branding screen. Every field is optional: absent means "use the value the
 *  theme derives", which is what every modal rendered before these existed. */
export interface ModalStyleOverrides {
  /** Card background. Overrides the theme's white / sable. */
  backgroundColor?: string | null | undefined;
  /** Body text. Overrides the theme's ink / cream. Secondary ("muted") text
   *  keeps its theme color, so the two stay distinguishable. */
  textColor?: string | null | undefined;
  /** Fill of the SECONDARY buttons (the wallet / social / provider entries, the
   *  retry button). The primary button is the accent's job. Unset => the theme's
   *  own surface color, which is what these buttons always used. */
  buttonColor?: string | null | undefined;
  /** Radius of the modal card itself, in px. */
  modalBorderRadius?: number | null | undefined;
  /** Radius of the buttons inside the modal, in px. Independent of the card's. */
  buttonBorderRadius?: number | null | undefined;
}

/** The card radius the modals used before it was configurable (1rem). */
const DEFAULT_MODAL_BORDER_RADIUS = 16;
/** Same, for the buttons. */
const DEFAULT_BUTTON_BORDER_RADIUS = 6;
/** Stacking order of the fixed overlay, before it was configurable. */
const DEFAULT_OVERLAY_Z_INDEX = 50;

/** A configured length, as a CSS px string. Anything that isn't a finite,
 *  non-negative number falls back to `fallback` - a malformed stored value must
 *  not collapse the card's chrome. */
function px(value: number | null | undefined, fallback: number): string {
  return `${typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback}px`;
}

/** A configured color, or the theme's own when unset. Empty string counts as
 *  unset: that's what the dashboard sends when the field is cleared. */
function color(value: string | null | undefined, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

/** `#rgb` / `#rrggbb` as 0-255 channels, or null for anything else (a named
 *  color, a `color-mix()`, a typo). */
function parseHex(value: string): [number, number, number] | null {
  const hex = value.trim().replace(/^#/, '');
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [Number.parseInt(full.slice(0, 2), 16), Number.parseInt(full.slice(2, 4), 16), Number.parseInt(full.slice(4, 6), 16)];
}

/** Text color that stays legible on `background`. The primary button's label was
 *  hardcoded white, which a light fill (the Amber accent preset, say) turns
 *  invisible - so it follows the fill's luminance instead. Unparseable colors
 *  keep white, the pre-existing behavior. */
export function readableTextOn(background: string): string {
  const rgb = parseHex(background);
  if (!rgb) return '#ffffff';
  // Relative luminance, sRGB coefficients (WCAG). The 0.6 cut lands white on
  // Chetta amber, and dark on a pale fill.
  const [r, g, b] = rgb;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6 ? CHETTA.ink : '#ffffff';
}

/** How much room a modal gives its header. 'hero' is the identity-forward set
 *  (login, KYC, ramp, the Privy sub-modal): roomier padding and a larger
 *  centered heading. 'compact' is every utility modal (send, balance, history,
 *  ...), which keeps the card's own 1.75rem padding. */
export type ModalVariant = 'hero' | 'compact';

/** Theme-derived CSS custom properties shared by every ChettaPay modal, plus the
 *  per-app overrides on top. One definition so the whole modal family stays
 *  visually in lockstep - a var added here reaches all of them at once. */
export function buildModalCssVars(
  theme: string,
  accentColor: string,
  overrides: ModalStyleOverrides = {},
  variant: ModalVariant = 'compact',
): CSSProperties {
  const isDark = theme === 'dark';
  const textColor = color(overrides.textColor, isDark ? CHETTA.cream : CHETTA.ink);
  // Only emitted when actually configured. Left out, the secondary buttons fall
  // back inside the CSS to whatever each already used - the theme surface for
  // the filled ones, `transparent` for the ghost one - so an unset field can't
  // flatten those two into the same look.
  const secondaryBg = color(overrides.buttonColor, '');
  return {
    '--chettapay-accent': accentColor,
    '--chettapay-bg': color(overrides.backgroundColor, isDark ? CHETTA.sable : '#ffffff'),
    '--chettapay-border': isDark ? CHETTA.bark : CHETTA.bone,
    '--chettapay-text': textColor,
    '--chettapay-muted': isDark ? CHETTA.dune : CHETTA.clay,
    // The primary button is the accent's, straight up; its label follows the
    // accent's luminance so a pale accent doesn't render white-on-white.
    '--chettapay-btn-primary-fg': readableTextOn(accentColor),
    ...(secondaryBg
      ? {
          '--chettapay-btn-secondary-bg': secondaryBg,
          '--chettapay-btn-secondary-fg': readableTextOn(secondaryBg),
        }
      : {}),
    '--chettapay-input-bg': isDark ? CHETTA.soot : CHETTA.sand,
    '--chettapay-error-bg': isDark ? '#2a1512' : '#fef2f2',
    '--chettapay-error-border': isDark ? '#7f1d1d' : '#fecaca',
    '--chettapay-error-text': isDark ? '#f87171' : '#dc2626',
    '--chettapay-success-text': isDark ? '#4ade80' : '#16a34a',
    '--chettapay-modal-border-radius': px(overrides.modalBorderRadius, DEFAULT_MODAL_BORDER_RADIUS),
    '--chettapay-buttons-border-radius': px(overrides.buttonBorderRadius, DEFAULT_BUTTON_BORDER_RADIUS),
    '--chettapay-buttons-height': '44px',
    '--chettapay-input-height': '44px',
    '--chettapay-input-border-radius': '0.5rem',
    '--chettapay-card-border-radius': '10px',
    ...(variant === 'hero'
      ? {
          '--chettapay-modal-padding': '2rem',
          '--chettapay-modal-heading-size': '1.375rem',
          '--chettapay-modal-subtitle-size': '0.9rem',
        }
      : {}),
  } as CSSProperties;
}

/** Everything a modal wrapper needs to dress itself from the app's branding:
 *  the theme pair its template already took, the overrides to forward to that
 *  template, and the inline style for the fixed overlay behind it. */
export interface ModalChrome {
  theme: string;
  accentColor: string;
  styleOverrides: ModalStyleOverrides;
  overlayStyle: CSSProperties;
}

/** Resolve the branding config into the props/styles a modal wrapper applies.
 *  Called by every `.chettapay-overlay` renderer so the z-index and the card
 *  overrides can't drift apart between modals. */
export function modalChrome(styles: ChettaPayStyles): ModalChrome {
  const zIndex = styles.modalZIndex;
  const theme = styles.theme ?? 'light';
  return {
    theme,
    // Only the DEFAULT follows the theme. An app that configured an accent gets
    // that accent in both themes - the brand's own color is not ours to swap.
    // Unconfigured, the ramp picks the coat gold that actually reads on the
    // card: amber on white, the lighter gold on sable.
    accentColor: styles.accentColor ?? (theme === 'dark' ? CHETTA.gold : CHETTA.amber),
    styleOverrides: {
      backgroundColor: styles.backgroundColor,
      textColor: styles.textColor,
      buttonColor: styles.buttonColor,
      modalBorderRadius: styles.modalBorderRadius,
      buttonBorderRadius: styles.buttonBorderRadius,
    },
    overlayStyle: {
      '--chettapay-overlay-z-index': typeof zIndex === 'number' && Number.isFinite(zIndex) ? zIndex : DEFAULT_OVERLAY_Z_INDEX,
    } as CSSProperties,
  };
}
