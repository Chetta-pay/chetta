# ChettaPay documentation site

Content for [chettapay-docs.vercel.app](https://chettapay-docs.vercel.app). Plain
Markdown plus a `meta.json` per directory that supplies the section title and its
page order.

Imported from the standalone `chettapay-docs` repository and rebranded in place,
so the tree under `docs/` is unchanged and the site's routing still maps
directory path to URL path: `docs/sdk-reference/chettapay-core.md` serves at
`/docs/sdk-reference/chettapay-core`.

```
docs/
  getting-started/   overview, quickstart, API keys, the example app
  core-concepts/     architecture, security model, funding modes, Stellar primitives
  sdk-reference/     @chettapay/react, @chettapay/core, adapters, Server API, webhooks, errors, MCP
  operator-guide/    the dashboard: build, integrations, treasury, users, monitor
  guides/            passkeys, deferred flow, payments UI, mainnet checklist
  smart-wallets/     C-address lifecycle, migration, quickstart
```

## Editing

Every directory's `meta.json` lists its pages by slug, and a slug must match a
sibling `<slug>.md` or `<slug>/` directory - adding a page means adding both.
Cross-page links are absolute (`https://chettapay-docs.vercel.app/docs/...`), so
renaming a page means updating the links that point at it.

## Relationship to the SDK reference in this repo

This site is the narrative documentation. The per-package API reference lives
next to the code it documents, in each package's own README - see
[`docs/README.md`](../docs/README.md). Where the two overlap, the package README
is the source of truth and this site links to it.
