<div align="center">

<img src="./assets/chetta-mark.svg" width="88" height="88" alt="ChettaPay" />

# ChettaPay

**Authentication and transaction infrastructure for Stellar and Solana applications.**

DPoP-bound sessions &middot; embedded &amp; external wallets &middot; multichain payments

[![npm](https://img.shields.io/npm/v/@chettapay/core?label=%40chettapay%2Fcore&color=A2590D)](https://www.npmjs.com/package/@chettapay/core)
[![npm](https://img.shields.io/npm/v/@chettapay/react?label=%40chettapay%2Freact&color=A2590D)](https://www.npmjs.com/package/@chettapay/react)
[![license](https://img.shields.io/badge/license-Apache--2.0-A2590D)](./LICENSE)

[Docs](./docs-site/README.md) &middot; [Dashboard](https://chettapay-dashboard.vercel.app) &middot; [Upgrade guide](./UPGRADE.md) &middot; [Changelog](./CHANGELOG.md)

</div>

---

Official SDK monorepo for [ChettaPay](https://chettapay.vercel.app). This repository is managed with
[Turborepo](https://turbo.build/repo) and contains the following published packages.

---

## Packages

> **0.11.3 is a patch (no breaking changes).** Session resilience in `@chettapay/core`: a session
> **survives reloads when the DPoP keypair fails to persist** (no more thumbprint-mismatch
> logout loop), `logout()` no longer races an in-flight or newer login (no resurrected or
> leaked sessions), and cross-tab / multi-client session-row writes are serialized and
> ownership-gated. In `@chettapay/react`, a consumer-built `ChettaPayClient` passed to
> `ChettaPayProvider` **keeps passkey login**, and StrictMode no longer leaves an orphaned
> client running (dev only). Packaging: **`@chettapay/core` is now a peer dependency only** of
> `@chettapay/react`, so the application's single copy of core is the one every package uses
> (npm 7+ installs peers automatically; npm 6, Yarn 1 and `--legacy-peer-deps` users must
> add core to their own dependencies), and the new `isChettaPayClient()` guard recognizes a
> client even across duplicate copies. `@chettapay/react@0.11.3` requires
> `@chettapay/core@^0.11.3`; if you pin exact versions, keep both on the same version.
>
> Earlier: **0.11.2** (additive) added the `client.stellar` namespace: sign **SEP-53
> message** and **SEP-10 challenge** ownership proofs across embedded and external wallets,
> both returning the same `sep53` scheme so a verifier treats them alike. The Transaction
> History modal goes **multichain** (network picker, per-chain explorer links, unified
> `{ amount, unit }` fees), and the Freighter adapter runs on `@stellar/freighter-api` 6.0.0.
>
> Latest break — **0.11.1**: `WalletBalanceRecord.balance` and `.available` are
> `string | null` — `null` means the chain could not be read and must render as unavailable,
> never as `0`. Every chain reports its native coin plus each token the app enabled
> (0.11.0 reported only the native token off Stellar). `@chettapay/react` gained a network picker
> (`<ChainSelect>`) that scopes the wallet-balance, enabled-assets, send and receive modals to
> one chain instead of tagging every row.
>
> Earlier breaks worth knowing before you jump versions: **0.11.0** moved every request to the
> **`/v2`** API and went multichain (Solana joins Stellar). **0.10.0** replaced the singular
> `walletAdapter` resolver and `loginWallet(id)` with a `walletAdapters: WalletAdapter[]` array
> (`login({ provider: id })`), and forced every user to re-authenticate once.
>
> Read [UPGRADE.md](./UPGRADE.md) for the migration steps and the
> [CHANGELOG](./CHANGELOG.md) for the full version history before upgrading.

### [`@chettapay/core`](./packages/core)

**Version:** `0.11.3` &nbsp;|&nbsp; **Registry:** [npm](https://www.npmjs.com/package/@chettapay/core)

Framework-agnostic TypeScript SDK. Provides the `ChettaPayClient` class and all lower-level utilities needed to integrate
ChettaPay authentication and multichain (Stellar + Solana) transactions into any JavaScript environment.

**Key features:**

- Authentication via Google, GitHub, Email OTP, Stellar wallets (Freighter, Albedo), and Solana wallets
  (Phantom, Solflare, Backpack)
- **DPoP-bound access + refresh tokens** (RFC 9449) — stolen tokens are useless without the per-session keypair. Web
  keypair is non-extractable; React Native keypair lives in Keychain / EncryptedSharedPreferences
- **Pluggable `Storage` adapter** — autodetects `localStorage` on web with in-memory fallback; first-class adapters for
  Expo SecureStore and `react-native-keychain` shipped as sub-path exports
- **Pluggable `KeyManager`** — `WebCryptoKeyManager` (browsers) or `NobleKeyManager` (RN) with autodetection
- **Race-safe `client.refresh()`** — concurrent 401 retries coalesce into one refresh; auto-retry on 401 with
  `DPoP-Nonce` rotation
- Stellar transaction building and submission through the ChettaPay API; balances via `refreshBalance()` /
  `getWalletBalance()` on `ChettaPayClient`
- **Multichain (Stellar + Solana)** - v2 wallet balances are tagged by `chain`, and every chain reports its native coin
  plus each token the app enabled. A balance is `null` when the chain could not be read, which must render as
  unavailable rather than as zero. Login supports **Sign In With Solana (SIWS)** and the SDK signs Solana transactions
  for sponsored external transfers. Solana external-wallet connect ships via `@chettapay/solana-wallet-standard-adapter`
- Real-time state management with a typed event system (`onAuthStateChange`)
- **Multi-venue swaps** - `getSwapQuote()` ranks routes across SDEX / Soroswap / Aquarius; `swap()` sets the trustline
  and executes through the standard tx pipeline with on-chain `minReceived` slippage. All three venues execute; which
  ones an app offers is driven by its per-app `GET /swap/config`
- **Earn (yield + lending)** - `getEarnProviders()` / `getEarnOpportunities()` / `getEarnPosition()` /
  `earnDeposit()` / `earnWithdraw()` unify DeFindex vaults and Blend pools behind one provider-selected API, each
  opportunity carrying its live APY
- **SEP-24 on/off-ramps** - anchor deposit/withdraw interactive flow via the `ramps` endpoints
- **Account creation** - `createAccount()` puts an external wallet's classic account on-chain via a sponsored
  `createAccount`; the wallet surfaces `existsOnStellar` + `fundingMode`
- **Sponsored trustlines** - `setTrustline` lets the app config decide who pays (server-side): embedded wallets hit
  the sponsored/self-pay trustline endpoint, external wallets co-sign whichever XDR the server returns. Pass
  `skipSponsorship` to force the user's own wallet to pay via `change_trust`
- **Stellar ownership proofs (SEP-53 / SEP-10)** - `client.stellar.sep53.signMessage()` and
  `client.stellar.sep10.sign()` prove wallet ownership to a verifier. External wallets sign client-side via their
  adapter, embedded wallets sign server-side, and both return the same `sep53` scheme
- **Network resilience** - per-request timeout (default 10s) and idempotent-request retry; typed `ChettaPayNetworkError`
- KYC verification flow - provider selection, session start, and status polling
- Transaction history - paginated fetch with status tracking
- Built-in wallet adapters (`FreighterAdapter`, `AlbedoAdapter`) plus a `walletAdapters: WalletAdapter[]` array for
  external wallet stacks (each adapter auto-renders as a login entry and overrides a built-in by its `type`)
- `AdapterFn`, `ChettaPayAdapter`, and `ChettaPayAdapters` types — generic adapter contract for custom signing flows (e.g.
  Trustless Work SDK)
- Active-session management — `listSessions()` / `revokeSession(familyId)` / `logoutEverywhere()` against the
  refresh-token family on the server
- `getUserProfile()` for in-memory PII access; `destroy()` to tear down the client cleanly
- Full TypeScript typings, ships with ESM and CJS builds

```bash
npm install @chettapay/core
```

**Web (no extra setup):**

```ts
import { ChettaPayClient } from '@chettapay/core';

const client = new ChettaPayClient({ apiKey: 'pk_...' });
```

**Expo / React Native:**

```ts
import 'react-native-get-random-values'; // at app entry
import { ChettaPayClient } from '@chettapay/core';
import { createSecureStoreAdapter } from '@chettapay/core/adapters/expo';

const storage = await createSecureStoreAdapter();
const client = new ChettaPayClient({ apiKey: 'pk_...', storage });
```

> HTTPS is required — DPoP needs `SubtleCrypto` and `crypto.randomUUID`, both secure-context only.

---

### [`@chettapay/react`](./packages/react)

**Version:** `0.11.3` &nbsp;|&nbsp; **Registry:** [npm](https://www.npmjs.com/package/@chettapay/react)

React bindings built on top of `@chettapay/core`. Provides a context provider, hook, and pre-built UI components for
drop-in authentication in React applications.

**Key features:**

- `<ChettaPayProvider>` — wraps your app and initialises the ChettaPay client; accepts `adapters` for custom signing flows
- `useChettaPay()` — hook exposing session state, `login`, `logout`, balances, transaction/history state, and modal entry
  points
- `<WalletButton>` — ready-made button that opens the authentication modal; dropdown includes Send, Receive, balance,
  and tx history; shows an inline spinner during in-progress transactions
- `<SendModal>` — full send flow in a single modal: asset picker, amount input, destination address, and inline
  transaction status (build → sign → success/error)
- `<ReceiveModal>` — displays the connected wallet address as a QR code with copy-to-clipboard; no external QR
  dependency required
- `<SwapModal>` - multi-venue swap UI over the core swap API, with a route selector across venues and paste-a-custom-token
- `<EarnModal>` - deposit/withdraw across DeFindex vaults and Blend pools, with live APY, wallet balance, over-spend
  guards, and auto-trustline on deposit; `useChettaPay()` mirrors the earn methods
- `<RampWidget>` - SEP-24 buy/sell flow wired to the core ramps endpoints (external wallets sign the pending XDR inline)
- `<KycModal>` - identity verification flow with provider selection and status polling _(UI preview - backend coming
  soon)_
- `<TxHistoryModal>` — paginated multichain transaction history viewer with auto-fetch on open, a network picker that
  filters server-side, per-chain explorer links (stellar.expert for Stellar, explorer.solana.com for Solana), and the
  unified `{ amount, unit }` fee per row
- `<WalletBalanceModal>` — multichain wallet balances (Stellar, Polygon, Solana): a `<ChainSelect>` picks the network and the rows are scoped to it; an unreadable chain shows a dash, never `0`
- `<EnabledAssetsModal>` — the app's dashboard-enabled assets for the network picked in the header, with per-asset
  trustline state; establish/remove trustlines (Stellar only — other chains are informational)
- `<DistributionRulesModal>` — manage the wallet's distribution rules
- `<ChainSelect>` — the shared network picker, exported alongside `chainsOf()` / `addressForChain()` / `resolveChain()`
  so you can drive the templates that take `chains` / `selectedChain` / `onSelectChain` yourself
- `useChains()` — the recommended hook for the app's configured chain order and primary address (returns
  `{ chains, primaryChain, primaryAddress, ready }`); what the built-in wallet button and pickers read from
- `<SessionsModal>` — drop-in active-sessions UI: lists every refresh-token family for the current user, per-row
  revoke, and a "Sign out everywhere" button
- `createChettaPayAdapterHook(key)` — factory for fully-typed hooks that wrap custom adapters with automatic XDR signing
- Template components for every modal — pure presentational layer for fully custom UIs
- Bundled stylesheet (`@chettapay/react/styles.css`) with `chettapay-` namespaced class names
- Peer dependency on React >= 18

```bash
npm install @chettapay/react @chettapay/core
```

---

### [`@chettapay/privy-adapter`](./packages/privy-adapter)

**Version:** `0.11.2` &nbsp;|&nbsp; **Registry:** [npm](https://www.npmjs.com/package/@chettapay/privy-adapter)

Client-side **Privy** wallet adapter for `@chettapay/core`. It drives the whole Privy flow itself - email / Google / GitHub
login, creating the user's Privy embedded wallet (Stellar or Solana), and raw-hash signing - then hands the signature to ChettaPay for
the standard SEP-10 (Stellar) or SIWS (Solana) login + transaction flow. Self-driving: you configure it once and register it in `walletAdapters`,
you do not wire up Privy's hooks yourself.

**Key features:**

- `createPrivyAdapter(config)` + `<PrivyAdapterProvider>` - a `WalletAdapter` plus interactive-login methods the ChettaPay
  login modal drives (renders a Privy button and sub-modal for the configured `loginMethods`)
- **Web and React Native / Expo** - the right build is picked automatically (`@privy-io/react-auth` on web,
  `@privy-io/expo` on RN); a non-React host fails fast with `PrivyAdapterUnsupportedError`
- Auto-sync host login (`onProviderAuthChange`) that recovers web OAuth redirects and persisted Privy sessions;
  optional `cleanupOAuthRedirect` and `debug` logging
- For server-side signing instead, use `@chettapay/privy-server-adapter` below

```bash
npm install @chettapay/privy-adapter @chettapay/core @stellar/stellar-sdk @privy-io/react-auth react react-dom
```

---

### [`@chettapay/privy-server-adapter`](./packages/privy-server-adapter)

**Version:** `0.11.2` &nbsp;|&nbsp; **Registry:** [npm](https://www.npmjs.com/package/@chettapay/privy-server-adapter)

Server-side Privy adapter. A stateless HTTP proxy that lets ChettaPay sign Stellar or Solana transactions through your **Privy**
server-wallet account without your `PRIVY_APP_SECRET` ever leaving your infrastructure. You run it in your own backend
and point ChettaPay at its URL. (Formerly published as `@chettapay/privy-adapter`, before the client-side rewrite took that
name.)

**Key features:**

- `createChettaPayPrivyAdapter(config)` - boots a Hono server (default port `3001`) exposing `POST /wallets/create`,
  `POST /wallets/sign`, `GET /wallets/:userId/address`, and `GET /health`. Returns `{ start, stop }` for lifecycle
  control
- Async `getCredentials()` resolver so any secret manager (AWS Secrets Manager, GCP Secret Manager, Vault) works;
  cached for 5 min by default and rebuilt automatically on rotation
- Bearer auth on `/wallets/*` using constant-time comparison (`crypto.timingSafeEqual`)
- Configurable body-size cap (`maxBodyBytes`, default 64 KiB) and per-request timeout (`requestTimeoutMs`, default 10 s)
- Per-userId wallet-address LRU cache (1000 entries, 10 min TTL) - no persistent state
- **Operation allowlist** - optional `allowedOperations` / `restrictToTrustlines` cap what `/wallets/sign` will sign;
  disallowed transactions are rejected with `TX_OPERATION_NOT_ALLOWED` (403) before any Privy round-trip
- Server-side only (Node 20+); do not import it in a client bundle

```bash
npm install @chettapay/privy-server-adapter
```

---

### [`@chettapay/accesly-adapter`](./packages/accesly-adapter)

**Version:** `0.11.2` &nbsp;|&nbsp; **Registry:** [npm](https://www.npmjs.com/package/@chettapay/accesly-adapter)

Client-side **Accesly** smart-account wallet adapter for `@chettapay/core`. Signs Stellar transactions with a user's
Accesly C-address (passkey + MPC) smart wallet, client-side.

**Key features:**

- `createAcceslyAdapter({ address, signXdr, meta? })` - wraps an Accesly session (`useAccesly` from `@accesly/react`)
  as a ChettaPay `WalletAdapter`; renders as an `accesly` login entry (`login({ provider: 'accesly' })`)

```bash
npm install @chettapay/accesly-adapter @chettapay/core @accesly/react @accesly/core
```

---

### [`@chettapay/stellar-wallets-kit-adapter`](./packages/stellar-wallets-kit-adapter)

**Version:** `0.11.2` &nbsp;|&nbsp; **Registry:** [npm](https://www.npmjs.com/package/@chettapay/stellar-wallets-kit-adapter)

Plugs [Stellar Wallets Kit](https://stellarwalletskit.dev) into ChettaPay as a set of wallet adapters, without
`@chettapay/core` having to depend on the kit. One install gives ChettaPay access to **every wallet module the kit
supports** - Freighter, Albedo, xBull, Lobstr, Rabet, Hana, Bitget, OneKey, Klever, Fordefi, CactusLink, HotWallet,
plus Ledger / Trezor / WalletConnect via opt-in.

**Key features:**

- `stellarWalletsKitAdapters(options?)` - factory that returns a `WalletAdapter[]` you pass to
  `ChettaPayClientConfig.walletAdapters` (one adapter per module)
- `StellarWalletsKitAdapter` - direct `WalletAdapter` implementation for use outside `ChettaPayClient`
- Defaults to 12 zero-setup modules; pass an explicit `modules` list to add Ledger / Trezor / WalletConnect or to
  trim the bundle
- SSR-safe: `stellarWalletsKitAdapters()` returns `[]` when there is no `window` (Next.js / Remix) and builds the real
  list when it re-runs on the client
- Peer deps: `@creit.tech/stellar-wallets-kit@^2.0.0` and `@chettapay/core@^0.11.2` (the kit is **not** bundled)

```bash
npm install @chettapay/stellar-wallets-kit-adapter @chettapay/core @creit.tech/stellar-wallets-kit
```

---

### [`@chettapay/solana-wallet-standard-adapter`](./packages/solana-wallet-standard-adapter)

**Version:** `0.11.2` &nbsp;|&nbsp; **Registry:** [npm](https://www.npmjs.com/package/@chettapay/solana-wallet-standard-adapter)

The Solana counterpart to `@chettapay/stellar-wallets-kit-adapter`. Connects user-controlled Solana wallets (Phantom,
Solflare, Backpack, ...) to `@chettapay/core` through the [Wallet Standard](https://github.com/wallet-standard/wallet-standard),
without bundling any wallet SDK into `@chettapay/core`. Login uses **SIWS (Sign In With Solana)** via each wallet's native
`solana:signIn` feature - the Solana analogue of Stellar's SEP-10 challenge.

**Key features:**

- `solanaWalletStandardAdapters(options?)` - discovers every installed Solana wallet and returns one `WalletAdapter`
  each to pass to `ChettaPayClientConfig.walletAdapters`; SSR-safe (returns `[]` when there is no `window`)
- `SolanaWalletStandardAdapter` - direct `WalletAdapter` implementation for use outside `ChettaPayClient`
- Peer dep: `@chettapay/core@^0.11.2` only. The `@wallet-standard/*` packages and `@solana/wallet-standard-features` are
  bundled as regular dependencies, so consumers don't install them; no wallet SDK is bundled

```bash
npm install @chettapay/solana-wallet-standard-adapter @chettapay/core
```

---

## Repository Structure

```
@chettapay/
├── packages/
│   ├── core/                            # @chettapay/core - framework-agnostic SDK
│   ├── react/                           # @chettapay/react - React bindings and UI components
│   ├── privy-adapter/                   # @chettapay/privy-adapter - client-side Privy wallet adapter (web + RN)
│   ├── privy-server-adapter/            # @chettapay/privy-server-adapter - server-side Privy signing proxy
│   ├── accesly-adapter/                 # @chettapay/accesly-adapter - client-side Accesly smart-wallet adapter
│   ├── stellar-wallets-kit-adapter/     # @chettapay/stellar-wallets-kit-adapter - Stellar Wallets Kit bridge
│   └── solana-wallet-standard-adapter/  # @chettapay/solana-wallet-standard-adapter - Solana Wallet Standard bridge
├── examples/                            # Example apps (e.g. privy-web)
├── docs/                                # API reference documentation
├── tests/                                # Smoke tests for the built SDK
├── turbo.json                           # Turborepo pipeline configuration
└── tsconfig.base.json                   # Shared TypeScript base configuration
```

---

## Development

This monorepo uses [Turborepo](https://turbo.build/repo) for task orchestration and [npm](https://docs.npmjs.com/cli/v10)
workspaces as the package manager (pinned via `packageManager` in the root `package.json`).

### Prerequisites

- Node.js >= 20 (matches the `engines` floor declared by every published package)
- npm >= 10

### Install dependencies

```bash
npm install
```

### Build all packages

```bash
npm run build
```

### Build in watch mode

```bash
npm run dev
```

### Type-check all packages

```bash
npm run lint
```

### Clean build artifacts

```bash
npm run clean
```

---

## License

MIT
