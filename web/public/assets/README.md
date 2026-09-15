# Served at `/assets/*`

`@chettapay/core` resolves two third-party wallet marks from this path:

- `/assets/logo_freighter.png` -> `LOGO_FREIGHTER`
- `/assets/logo_albedo.svg` -> `LOGO_ALBEDO`

They are **not in this repository**, so the SDK's wallet icons 404 until you add
them here and deploy this site to the host those constants point at
(`chettapay.vercel.app`). See `packages/react/src/constants.ts`.

Get the files from each project's own brand resources rather than copying them
from another site - they are Freighter's and Albedo's trademarks, and the SDK
links them rather than embedding a redrawn copy for exactly that reason.

The ChettaPay mark itself needs nothing here: it is inlined as a data URI in the
SDK, so it renders offline and under a strict CSP.
