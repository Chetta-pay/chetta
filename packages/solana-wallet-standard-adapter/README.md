# @chettapay/solana-wallet-standard-adapter

Connect user-controlled Solana wallets (Phantom, Solflare, Backpack, ...) to
`@chettapay/core` through the [Wallet Standard](https://github.com/wallet-standard/wallet-standard),
the headless substrate that `@solana/wallet-adapter` is built on. No wallet SDK is
bundled into `@chettapay/core`.

This is the Solana counterpart to `@chettapay/stellar-wallets-kit-adapter`. Login uses
**SIWS (Sign In With Solana)** via the wallet's native `solana:signIn` feature -
the Solana analogue of Stellar's SEP-10 challenge.

> **0.11.2** requires `@chettapay/core@^0.11.2` (peer range bump only; no adapter
> changes).
>
> **0.11.1** introduced the adapter. It declares
> `chain: 'SOLANA'`, which is what routes `login({ provider })` through the SIWS
> flow instead of Stellar's SEP-10 challenge - end to end, discovery through
> login.

## Installation

```bash
npm install @chettapay/solana-wallet-standard-adapter @chettapay/core
```

`@chettapay/core` is the only peer dependency. The `@wallet-standard/*` packages and
`@solana/wallet-standard-features` are real dependencies of this adapter, so you
do not install them yourself.

## Usage

```ts
import { ChettaPayClient } from '@chettapay/core';
import { solanaWalletStandardAdapters } from '@chettapay/solana-wallet-standard-adapter';

const client = new ChettaPayClient({
  apiKey: '...',
  walletAdapters: [...solanaWalletStandardAdapters()],
});
```

`solanaWalletStandardAdapters()` discovers every installed Solana wallet and returns one
adapter each. It is SSR-safe (returns `[]` when `window` is undefined), so build
the `ChettaPayClient` on the client.

### Alongside Stellar wallets

`walletAdapters` is one flat list, so Stellar and Solana wallets coexist in it.
That needs two packages the install command above does not cover -
`@chettapay/stellar-wallets-kit-adapter` and its own peer
`@creit.tech/stellar-wallets-kit`:

```bash
npm install @chettapay/stellar-wallets-kit-adapter @creit.tech/stellar-wallets-kit
```

```ts
import { ChettaPayClient } from '@chettapay/core';
import { solanaWalletStandardAdapters } from '@chettapay/solana-wallet-standard-adapter';
import { stellarWalletsKitAdapters } from '@chettapay/stellar-wallets-kit-adapter';
import { Networks } from '@creit.tech/stellar-wallets-kit';

const client = new ChettaPayClient({
  apiKey: '...',
  walletAdapters: [...stellarWalletsKitAdapters({ network: Networks.PUBLIC }), ...solanaWalletStandardAdapters()],
});
```

### Options

- `wallets?: string[]` - include only these wallet names (default: all found).
- `labels?: Record<string, string>` - per-wallet button-label overrides.
- `groupLabel?: string` - the login-UI gateway label these wallets share
  (default `'Solana Wallet'`).

### `SolanaWalletStandardAdapter`

The class behind the factory, exported for direct use outside `ChettaPayClient`.
Beyond the shared `WalletAdapter` contract it carries the Solana-specific
surface:

| Member                      | Purpose                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `chain`                     | Always `'SOLANA'` - what routes login through SIWS                                                            |
| `supportsSignIn`            | Whether the wallet exposes the native `solana:signIn` feature                                                 |
| `signIn(input)`             | SIWS login; throws if the wallet lacks `solana:signIn` (check `supportsSignIn` first, then use `signMessage`) |
| `signMessage(message)`      | Raw message signing                                                                                           |
| `signSolanaTransaction(tx)` | Signs a Solana transaction (sponsored external transfers)                                                     |
