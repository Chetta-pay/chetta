# Upgrade guide

## 0.11.2 -> 0.11.3

No breaking changes. 0.11.3 is a patch: sessions survive reloads when the DPoP
keypair fails to persist, `logout()` no longer races an in-flight or newer
login, cross-tab session writes are serialized and ownership-gated, and a
consumer-built `ChettaPayClient` passed to `ChettaPayProvider` keeps passkey login.

One packaging change: `@chettapay/core` moved from `dependencies` to
`peerDependencies` in `@chettapay/react`. The old `dependencies` entry could
install a second, package-local copy of core, which broke `instanceof`, split
the live-client registry, and let two clients share one persisted session row.
On npm 7+ there is nothing to do - peer dependencies install automatically. On
npm 6, Yarn 1, or with `--legacy-peer-deps`, add `@chettapay/core` to your own
dependencies. `@chettapay/react@0.11.3` requires `@chettapay/core@^0.11.3`; if you
pin both packages to exact versions, keep them on the same version.

One type-level removal in `@chettapay/react`: `WalletButtonTemplateProps` no
longer carries `walletType`. The default template never rendered it (the
wallet-logo mapping lives in the transaction modal, which derives its own
value). If a custom wallet-button template of yours read `props.walletType`,
reconstruct it from the wallet exposed by `useChettaPay()`:

```tsx
const { wallet } = useChettaPay();
const walletType = wallet?.custody === 'external' ? wallet.provider : null;
```

See the [CHANGELOG](./CHANGELOG.md) for the details.

## 0.11.1 -> 0.11.2

No breaking changes and no migration steps. 0.11.2 is additive: the
`client.stellar` namespace (SEP-53 message + SEP-10 challenge ownership
proofs), a multichain Transaction History modal in `@chettapay/react`, and the
Freighter adapter migrated to `@stellar/freighter-api` 6.0.0. Existing call
sites compile and behave unchanged. See the [CHANGELOG](./CHANGELOG.md) for
the details.

## 0.11.0 -> 0.11.1

0.11.1 reworks the multichain wallet responses. The wire format moved to a
`chains` envelope and an unreadable chain is now represented explicitly instead
of being flattened away, which changes two public types.

### 1. `balance` and `available` are now `string | null`

`WalletBalanceRecord.balance` and `.available` were `string`. They are now
nullable: `null` means **the chain could not be read** (an unreachable RPC), not
an empty wallet. It is never coerced to `'0'`, precisely so the UI can tell the
two apart.

```ts
// BEFORE (0.11.0) — always a string
const n = parseFloat(record.balance);

// AFTER (0.11.1) — null is "unavailable", not zero
const n = record.balance === null ? null : parseFloat(record.balance);
```

Render `null` as a dash or an "unavailable" state. Rendering it as `0` tells the
user their funds are gone.

### 2. Every chain reports a full asset list

At 0.11.0 the non-Stellar chains reported only their native token. Now every
chain returns its native coin **plus each token the app enabled**, so one loop
handles Stellar, Polygon and Solana alike. If you special-cased "Solana only has
SOL", drop that branch.

### 3. New balance fields

`decimals?: number`, `limit?: string` and `sponsored?: boolean` join the record,
and `type` gained `'token'` alongside the Stellar classic values. Format amounts
against each token's own `decimals` (Stellar stays at 7) rather than assuming 7
everywhere. An exhaustive `switch` on `type` needs a `'token'` arm.

### 4. `@chettapay/react`: templates require the chain props

`WalletBalanceModalTemplate`, `EnabledAssetsModalTemplate`, `SendModalTemplate`
and `ReceiveModalTemplate` now take `chains`, `selectedChain` and
`onSelectChain`. If you mount a template yourself, build them with the newly
exported helpers:

```tsx
import type { WalletChain } from '@chettapay/core';
import { useEffect, useState } from 'react';
import { ChainSelect, addressForChain, useChains, useChettaPay } from '@chettapay/react';

const { wallets } = useChettaPay();
// useChains() applies the app's configured chain order from /config; prefer it
// over chainsOf(wallets) alone, which cannot know that order.
const { chains } = useChains();

// Start at null and settle on the first configured chain in an effect - the
// same thing the built-in modals do. Seeding with useState(primaryChain) would
// pin the picker to null forever: /config is still in flight on the first
// render, primaryChain is null until it resolves, and useState only reads its
// argument once.
const [selectedChain, setSelectedChain] = useState<WalletChain | null>(null);
useEffect(() => {
  if (selectedChain === null && chains.length > 0) setSelectedChain(chains[0]!);
}, [chains, selectedChain]);

const walletAddress = addressForChain(wallets, selectedChain);
```

The wrapper components (`<WalletBalanceModal>` and friends) do this for you — no
change needed if you use those.

### 5. `setTrustline` drops the `sponsored` opt-in flag

`setTrustline(asset, { sponsored: true })` no longer type-checks. Who pays is now
decided server-side from the app config, not by a caller flag: embedded wallets
hit `POST /wallet/assets/trustline` (the server sponsors or self-pays, then
submits) and external wallets co-sign whichever XDR the build endpoint returns.
The only knob left is the opt-out `skipSponsorship`, which forces a self-pay
`change_trust` — the same shape as `skipSponsorship` on `signTx` / payments.

```ts
// BEFORE (0.11.0)
await setTrustline(asset, { sponsored: true });

// AFTER (0.11.1) — drop the flag; the app config decides
await setTrustline(asset);
// ...or force the user to pay their own reserve + fee:
await setTrustline(asset, { skipSponsorship: true });
```

### 6. `TxBuildSignSubmitBody` / `TxBuildSignSubmitContent` became unions (types only)

`POST /v2/tx/build-sign-submit` gained a `chain` field (absent = `STELLAR`) and
answers per-chain, so both generated types now carry a non-Stellar member. Reading
a Stellar-only field (`resultCode`, `estimatedFee`, `options`, the `operation`
union) off the bare type no longer compiles — narrow first:

```ts
const resultCode = 'resultCode' in content ? content.resultCode : undefined;
```

No runtime behaviour changed and the request stays backward-compatible (omit
`chain` and the endpoint behaves exactly as before); only the static types are
stricter.

### 7. New exported types

`WalletAssetsContent`, `EnabledAssetRecord`, `ChettaPayPersistedWallet` and
`SendPaymentParams` are now public.

## 0.10.x -> 0.11.0

0.11.0 is the multichain release: Solana joins Stellar, and **every SDK request
moved from `/v1` to `/v2`**.

### 1. The SDK now calls `/v2`

`basePath` is built as `${baseUrl}/v2`. If you pass a custom `baseUrl`, keep
passing the **origin only** (`https://sdk.api.example.com`) — the SDK appends the
version prefix itself. Your backend must serve the `/v2` routes; an sdk-api that
only has `/v1` will 404 across the board.

### 2. Balances are multichain

`WalletBalanceRecord` gained `chain` (`'STELLAR' | 'POLYGON' | 'SOLANA'`), and
the balance response gained `multichain`, set when more than one chain came back.
Records minted before multichain carry no `chain`; treat absent as `'STELLAR'`
rather than as unknown.

### 3. The `WalletAdapter` contract is chain-aware

Adapters may declare `chain`. **Absent means `'STELLAR'`**, so existing Stellar
adapters need no change. A single `walletAdapters` array can now carry Stellar
and Solana adapters side by side. `signTransaction` and `signAuthEntry` became
**optional** on the contract, because non-Stellar adapters do not implement them
— if you consume an adapter directly, guard those calls.

### 4. Sign In With Solana (SIWS)

New types `SolanaSignInInput` / `SolanaSignInOutput` (with a raw `signMessage`
fallback) and `signSolanaTransaction`. An adapter declaring `chain: 'SOLANA'` is
routed through SIWS instead of Stellar's SEP-10 challenge. Connect
user-controlled Solana wallets with `@chettapay/solana-wallet-standard-adapter`.

## 0.9.x -> 0.10.0

0.10.0 unifies external wallets into a single `walletAdapters: WalletAdapter[]`
array and removes the old singular `walletAdapter` resolver, the `loginWallet()`
method, and the 0.8-era `ui.renderWallets` slot / `/picker` bundle. The login
modal now renders one login entry per registered adapter automatically.

### 1. `walletAdapter` (singular resolver) -> `walletAdapters` (array)

`ChettaPayClientConfig.walletAdapter` is replaced by `walletAdapters?: WalletAdapter[]`.
Built-in `FreighterAdapter` / `AlbedoAdapter` still auto-register; pass any extra
adapters as array entries (an entry overrides a built-in with the same `type`).

```ts
// BEFORE (0.9.x)
new ChettaPayClient({ apiKey, walletAdapter: stellarWalletsKit({ network }) });

// AFTER (0.10.0)
new ChettaPayClient({ apiKey, walletAdapters: stellarWalletsKitAdapters({ network }) });
```

### 2. `stellarWalletsKit(...)` -> `stellarWalletsKitAdapters(...)`

`@chettapay/stellar-wallets-kit-adapter` now exports `stellarWalletsKitAdapters()`,
which returns a `WalletAdapter[]` (one per module) instead of a resolver. It is
also SSR-safe: it returns `[]` when there is no `window` and builds the real list
when it re-runs on the client. Requires `@chettapay/core@^0.10.0` /
`@chettapay/react@^0.10.0`.

### 3. `loginWallet(id)` -> `login({ provider: id })`

The dedicated wallet-login method is gone. Enter any wallet through the unified
login entry point, using the adapter's `type` as the provider id.

```ts
// BEFORE
client.loginWallet('xbull');
// AFTER
client.login({ provider: 'xbull' });
```

### 4. `ui.renderWallets` / `/picker` bundle removed

The 0.8 `ui.renderWallets` slot and the `@chettapay/stellar-wallets-kit-adapter/picker`
bundle (`createStellarWalletsKitBundle`) no longer exist. The login modal builds
the wallet list from the registered `walletAdapters`, so you just pass them:

```tsx
// BEFORE (0.8/0.9)
<ChettaPayProvider
  client={{ apiKey: '…', walletAdapter: bundle.walletAdapter }}
  ui={{ renderWallets: bundle.renderWallets }}
>

// AFTER (0.10.0)
<ChettaPayProvider client={{ apiKey: '…', walletAdapters: stellarWalletsKitAdapters({ network }) }}>
```

### 5. Custom `WalletAdapter` authors

Adapters now carry display metadata: the constructor / factory takes a
`meta: WalletAdapterMeta` (at least `{ label }`) so the adapter can render its own
login entry. For example `new StellarWalletsKitAdapter('freighter', { label: 'Freighter' })`.

### 6. `@chettapay/react`: `useChettaPay().walletAddress` / `walletType` -> `wallet`

The context no longer exposes `walletAddress` or `walletType`. Read the wallet
through `wallet: WalletInfo | null` instead.

```tsx
// BEFORE
const { walletAddress, walletType } = useChettaPay();
// AFTER
const { wallet } = useChettaPay();
const address = wallet?.address;
const custody = wallet?.custody; // 'internal' | 'smart' | 'external'
```

### 7. One-time re-login (SDK only)

The local storage namespace was widened (the apiKey hash went from 8 to 32 hex
chars), which orphans sessions persisted by older builds. Every user
re-authenticates once after the host app ships 0.10.0. No backend change, no
migration, no action required.

## 0.8.x → 0.9.0

The SDK surface drops the legacy wallet `publicKey` alias in favor of `address`,
and surfaces the internal wallet type as `'internal'` instead of `'custodial'`.
**The `sdk-api` wire is unchanged** — it still emits `'custodial'` and
`publicKey`, and `@chettapay/core` ≥0.9.0 remaps both at the client boundary. So
SDKs ≤0.8.x keep working, sessions persisted by older SDKs are migrated
transparently on read, and no coordinated backend deploy is required.

### Most consumers — no change

If you read the wallet address through `useChettaPay().walletAddress`
(`@chettapay/react`), nothing changes — it's resolved internally from
`session.wallet.address`.

### Required changes

#### 1. Reading the wallet address (headless `@chettapay/core`)

`session.wallet.publicKey` is removed; read `session.wallet.address` (it always
held the same value).

```ts
client.onAuthStateChange((s) => {
  if (s.step !== 'authenticated') return;
  // BEFORE (≤0.8.x): s.session.wallet.publicKey
  // AFTER  (0.9.0):  s.session.wallet.address
  const addr = s.session.wallet.address;
});
```

#### 2. `wallet.type` `'custodial'` → `'internal'`

The developer-facing union is now `'internal' | 'smart' | 'external'`. Code
branching on `wallet.type === 'custodial'` must switch to `'internal'`.

#### 3. Custom `WalletAdapter` authors

`ConnectWalletResponse` is now `{ address }` only — drop the duplicate
`publicKey`.

```ts
// BEFORE
async connect(): Promise<ConnectWalletResponse> {
  return { address: pubkey, publicKey: pubkey };
}
// AFTER
async connect(): Promise<ConnectWalletResponse> {
  return { address: pubkey };
}
```

### Deploy ordering

`@chettapay/core` 0.9.0 sends `address` (preferred) on `/tx/*` request bodies. The
`sdk-api` accepts **either `address` or `publicKey`** (`address` wins), so ship
the matching `sdk-api` change before/with `@chettapay/core` 0.9.0.

### `@chettapay/stellar-wallets-kit-adapter`

`connect()` now returns `{ address }` only. Requires `@chettapay/core@^0.9.0` /
`@chettapay/react@^0.9.0` (peer ranges pinned).

## 0.7.x → 0.8.0

`<ChettaPayProvider>` is reshaped to make the wallet picker pluggable and to give
the consumer explicit control over the remote `/applications/config` fetch.
All changes are mechanical renames; nothing in `@chettapay/core` moves.

### Required changes

#### 1. `config` → `client`

The provider's first prop is renamed from `config` to `client`. It now accepts
**either a `ChettaPayClientConfig` (the current shape) or a pre-built
`ChettaPayClient` instance**. The provider constructs the client at first render
in both cases.

```tsx
// BEFORE
<ChettaPayProvider config={{ apiKey: '…', walletAdapter }}>

// AFTER (no behavior change beyond the rename)
<ChettaPayProvider client={{ apiKey: '…', walletAdapter }}>
```

The pre-built form is useful if you want to keep a reference to the client
outside React (tests, server actions, jobs):

```tsx
const client = new ChettaPayClient({ apiKey: '…', walletAdapter });
<ChettaPayProvider client={client}>
```

> **Note**: the client is locked at first render. Changing the prop afterwards
> is ignored. To swap clients, unmount and remount the provider. This already
> matched the 0.7.x behavior — it's just now explicit.

#### 2. `styles` → `appConfig.styles`

The top-level `styles` prop moves under a new `appConfig` block whose shape
mirrors what `/applications/config` returns.

```tsx
// BEFORE
<ChettaPayProvider config={{…}} styles={{ theme: 'dark' }}>

// AFTER
<ChettaPayProvider client={{…}} appConfig={{ styles: { theme: 'dark' } }}>
```

#### 3. The remote-config fetch is now opt-out

If you pass `appConfig` (even as `{}`), the provider **skips** the `GET
/applications/config` call entirely. Missing fields fall back to the defaults
already baked into `LoginModalTemplate` (light theme, ChettaPay logo, no social
providers, etc.).

If you **don't** pass `appConfig`, the SDK fetches `/applications/config` on
mount exactly like 0.7.x did. The previous 3-level styles merge
(`remote.styles + propStyles + providers merge`) is removed: you now either get
the remote config or your local one, not a hybrid.

```tsx
// Force defaults, no network call:
<ChettaPayProvider client={{…}} appConfig={{}}>

// Keep the existing remote-config behavior:
<ChettaPayProvider client={{…}}>

// Local override of styles, no network call:
<ChettaPayProvider client={{…}} appConfig={{ styles: { theme: 'dark' } }}>
```

#### 4. Remote-config errors now log to `console.error`

Previously, a failed `/applications/config` fetch was silently swallowed. It
now logs via `console.error('[ChettaPayProvider] getAppConfig failed', err)`,
matching how the rest of `@chettapay/core` reports unexpected failures.

### New: `renderWallets` slot

> **Removed in 0.10.0.** The `ui.renderWallets` slot and the `/picker` bundle
> below were superseded by the `walletAdapters[]` model. See the 0.9.x -> 0.10.0
> section above. The rest of this section applies only to 0.8.x / 0.9.x.

`<ChettaPayProvider>` accepts a new optional `ui.renderWallets` slot that
replaces the hardcoded Freighter+Albedo list inside the LoginModal wallet
picker. If you don't pass it, the default Freighter+Albedo list is shown
exactly as before.

```tsx
import type { RenderWalletsSlot } from '@chettapay/react';

const renderWallets: RenderWalletsSlot = ({ onConnect, authState }) => (
  <MyCustomWalletGrid onPick={onConnect} disabled={authState.step !== 'idle'} />
);

<ChettaPayProvider client={{…}} ui={{ renderWallets }}>
```

For the common case of "drop in the Stellar Wallets Kit picker", the new
`@chettapay/stellar-wallets-kit-adapter/picker` subpath ships a ready-made
bundle:

```tsx
import { createStellarWalletsKitBundle } from '@chettapay/stellar-wallets-kit-adapter/picker';
import { Networks } from '@creit.tech/stellar-wallets-kit';

const bundle = createStellarWalletsKitBundle({
  network: Networks.PUBLIC,
  picker: { wallets: ['xbull', 'lobstr', 'freighter'] },
});

<ChettaPayProvider
  client={{ apiKey: '…', walletAdapter: bundle.walletAdapter }}
  ui={{ renderWallets: bundle.renderWallets }}
>
```

### `@chettapay/stellar-wallets-kit-adapter` — no required changes

If you already consume `stellarWalletsKit({ network })` for `walletAdapter`,
nothing changes. The root export stays the same callable
`WalletAdapterResolver`. React only enters the picture if you import from
`@chettapay/stellar-wallets-kit-adapter/picker`, and is declared as an optional
peer dependency — headless consumers don't pull it in.

### Why the breaking change

- The previous `config: ChettaPayClientConfig` prop leaked SDK plumbing
  (`storage`, `keyManager`, …) into the React API. `client` is a cleaner
  contract that also lets you reuse the constructed client outside React.
- The previous 3-way style merge was implicit and hard to reason about
  (props sometimes won, sometimes the remote did). The new "presence =
  opt-out" rule is one line and predictable.
- The wallet picker was hardcoded to Freighter+Albedo, which forced
  `@chettapay/react` to bundle wallet-specific logos and labels. The
  `renderWallets` slot decouples the modal from any particular wallet
  ecosystem.
