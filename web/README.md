# chettapay-web

The ChettaPay marketing site. Vite + React, static output, deployable to Vercel
as-is.

```bash
npm run dev -w chettapay-web       # http://localhost:5175
npm run build -w chettapay-web     # -> web/dist
npm run preview -w chettapay-web
```

## Why it has no `@chettapay/*` dependency

Deliberate. The site describes the SDK but does not import it, so it builds from
a clean checkout without `turbo build` running first. That keeps the Vercel
build command a plain `npm run build`, with no workspace ordering to get wrong.
If you ever add a live SDK demo here, that stops being true and the build
command has to build the workspace first.

## Content

All copy lives in `src/content.ts`, separate from layout, so copy edits and a
Spanish translation never mean touching components.

Two deliberate gaps are marked in that file and visible on the page:

- **Pricing says "TBD".** Put real commercial terms in before launch.
- **`facts` holds properties of the SDK, not traction.** The reference site this
  page is modelled on leads with apps-launched / wallets-created / npm-download
  counts. Those are another company's figures; publishing them as ours would be
  fabricated. `PLACEHOLDER_STATS` is where real numbers go once they exist.

## `public/assets/`

`@chettapay/core` resolves two third-party wallet marks from `/assets/` on this
site's host. They are not in this repository - see `public/assets/README.md`.
Until they are added, those wallet icons 404 in the SDK's login modal.

## Deploying

`vercel.json` sets the framework preset, output directory and an SPA rewrite.
From this directory:

```bash
vercel        # preview
vercel --prod # production
```

Set the Vercel project's **root directory** to `web`, so the build does not try
to build the whole monorepo.
