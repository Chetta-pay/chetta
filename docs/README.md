# Docs

The API reference lives with each package, next to the code it documents:

- [`@chettapay/core`](../packages/core/README.md) — `ChettaPayClient`, auth flows, transactions, balances, swaps, earn, ramps
- [`@chettapay/react`](../packages/react/README.md) — `ChettaPayProvider`, `useChettaPay()`, components and templates
- [`@chettapay/privy-adapter`](../packages/privy-adapter/README.md)
- [`@chettapay/privy-server-adapter`](../packages/privy-server-adapter/README.md)
- [`@chettapay/accesly-adapter`](../packages/accesly-adapter/README.md)
- [`@chettapay/stellar-wallets-kit-adapter`](../packages/stellar-wallets-kit-adapter/README.md)
- [`@chettapay/solana-wallet-standard-adapter`](../packages/solana-wallet-standard-adapter/README.md)

The narrative documentation — getting started, core concepts, the operator
guide, guides and smart wallets — lives in [`docs-site/`](../docs-site/README.md)
and is published at [chettapay-docs.vercel.app](https://chettapay-docs.vercel.app).

Version history is in [CHANGELOG.md](../CHANGELOG.md); migration steps between
breaking versions are in [UPGRADE.md](../UPGRADE.md).

> This folder previously held `1 ChettaPay react.md` and `2 ChettaPay core.md`, hand-maintained
> copies of the two package READMEs. They drifted out of sync and were removed in 0.11.1.
> The package READMEs are the single source of truth.
