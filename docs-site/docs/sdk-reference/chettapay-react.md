---
title: "@chettapay/react"
---

React hooks and pre-built UI components for ChettaPay. Built on top of `@chettapay/core`.

**Version:** `0.10.1`

```bash
npm install @chettapay/react
```

---

## `<ChettaPayProvider>`

Wraps your application root. Required for all hooks and components to work. Internally renders every ChettaPay modal — login, transaction, send, receive, KYC, ramp, tx history, wallet balance, enabled-assets, swap, earn, sessions, and distribution-rules — so you do not need to mount them manually.

```tsx
import { ChettaPayProvider } from '@chettapay/react';

<ChettaPayProvider
  client={{ apiKey: 'pub_testnet_xxxxxxxxxxxxxxxxxxxx' }}
>
  <App />
</ChettaPayProvider>
```

**Props:**

| Prop               | Type                                 | Required | Description                                                                                  |
|--------------------|--------------------------------------|----------|----------------------------------------------------------------------------------------------|
| `client`           | `ChettaPayClientConfig \| ChettaPayClient` | Yes      | A `ChettaPayClientConfig` (the provider builds the client) or a pre-built `ChettaPayClient` instance. Locked at first render. |
| `appConfig`        | `ChettaPayConfig`                       | No       | Local override of the remote `/applications/config` (styles, app name). If provided, the remote fetch is skipped. |
| `adapters`         | `ChettaPayAdapters`                     | No       | Transaction-building adapters (e.g. `@chettapay/accesly-adapter`), consumed via `createChettaPayAdapterHook`. This is **not** the wallet-login slot — wallet login providers go on the client's `walletAdapters` config; see [Wallet Adapters](https://chettapay-docs.vercel.app/docs/sdk-reference/wallet-adapters). |
| `onStorageDegrade` | `OnStorageDegrade`                   | No       | Notified when persistent storage silently degrades to in-memory mode.                        |

> To register wallet-login providers (Stellar Wallets Kit, Privy), put them on `client.walletAdapters`, not on this component. See [Wallet Adapters](https://chettapay-docs.vercel.app/docs/sdk-reference/wallet-adapters).

**`ChettaPayClientConfig`:**

| Option           | Type             | Default                          | Description                                 |
|------------------|------------------|----------------------------------|---------------------------------------------|
| `apiKey`         | `string`         | —                                | **Required.** Your ChettaPay API key.          |
| `stellarNetwork` | `StellarNetwork` | `'testnet'`                      | Target network: `'testnet'` or `'mainnet'`. |
| `baseUrl`        | `string`         | `'https://chettapay-api.vercel.app'` (the SDK appends `/v1`) | Override the ChettaPay API base URL. |

---

## `useChettaPay()`

The primary hook. Provides access to all ChettaPay functionality from a single import. Must be used inside `<ChettaPayProvider>`.

```tsx
'use client';
import { useChettaPay } from '@chettapay/react';

function MyComponent() {
  const {
    isAuthenticated,
    verified,
    wallet,
    login,
    logout,
    buildTx,
    signAndSubmitTx,
    signTx,
    submitTx,
    buildAndSignAndSubmitTx,
    runTx,
    tx,
    txHistory,
    network,
    setNetwork,
    walletBalance,
    refreshWalletBalance,
    enabledAssets,
    refreshAssets,
    setTrustline,
    getSwapConfig,
    getSwapTokens,
    getSwapQuote,
    swap,
    getEarnProviders,
    getEarnOpportunities,
    getEarnPosition,
    earnDeposit,
    earnWithdraw,
    getClient,
    openLoginModal,
    openTxModal,
    openKycModal,
    openRampModal,
    openTxHistoryModal,
    openWalletBalanceModal,
    openSendModal,
    openReceiveModal,
    openEnabledAssetsModal,
    openSwapModal,
    openEarnModal,
    openSessionsModal,
    openDistributionRulesModal,
    sessions,
    appConfig,
    styles,
  } = useChettaPay();
}
```

---

### Authentication

| Property          | Type                                    | Description                                                               |
|-------------------|-----------------------------------------|---------------------------------------------------------------------------|
| `isAuthenticated` | `boolean`                               | Whether the user has an active session.                                   |
| `verified`        | `boolean`                               | `true` once the server has confirmed the session (login / refresh / resume). `false` while a cold-start session is still optimistic — gate sensitive actions (e.g. signing) on this. |
| `wallet`          | `WalletInfo \| null`                    | The authenticated wallet as a discriminated union over `custody` (`internal` \| `smart` \| `external`), or `null` when unauthenticated. Use `wallet.address` for the on-chain address and `wallet.provider` for the login/wallet provider. |
| `login`           | `(options: ChettaPayLoginOptions) => void` | Initiates an authentication flow.                                         |
| `logout`          | `() => void`                            | Signs out the current user and clears the session.                        |

**`ChettaPayLoginOptions`:**

| Value                                    | Description                                                       |
|------------------------------------------|-------------------------------------------------------------------|
| `{ provider: 'google' }`                 | Opens Google OAuth flow.                                          |
| `{ provider: 'github' }`                 | Opens GitHub OAuth flow.                                          |
| `{ provider: 'email', email: string }`   | Sends an OTP code to the provided email address.                 |
| `{ provider: WalletType.FREIGHTER }`     | Connects the built-in Freighter wallet (id `'freighter-native'`). |
| `{ provider: WalletType.ALBEDO }`        | Connects the built-in Albedo wallet (id `'albedo-native'`).      |
| `{ provider: '<adapter id>' }`           | Any wallet registered via `walletAdapters` (`'xbull'`, `'lobstr'`, `'privy'`, …). See [Wallet Adapters](https://chettapay-docs.vercel.app/docs/sdk-reference/wallet-adapters). |

---

### Transactions

| Property                  | Type                                                          | Description                                                              |
|---------------------------|---------------------------------------------------------------|-------------------------------------------------------------------------|
| `tx`                      | `TransactionState`                                            | Current transaction state (reactive).                                   |
| `buildTx`                 | `(operation, params, options?) => Promise<BuildOutcome>`     | Builds an unsigned Stellar transaction.                                |
| `signAndSubmitTx`         | `(unsignedXdr?: string) => Promise<SubmitOutcome>`           | Signs and submits a built transaction (defaults to the current `built` XDR if omitted). |
| `signTx`                  | `(unsignedXdr: string) => Promise<SignOutcome>`             | External-wallet only — sign without submitting.                        |
| `submitTx`                | `(signedXdr: string) => Promise<SubmitOutcome>`            | Submits an already-signed XDR.                                         |
| `buildAndSignAndSubmitTx` | `(operation, params, options?) => Promise<SubmitOutcome>`   | One-shot build → sign → submit.                                        |
| `runTx`                   | `(operation, params, options?) => Promise<SubmitOutcome>`   | Alias of `buildAndSignAndSubmitTx`.                                    |
| `openTxModal`             | `() => void`                                                 | Opens the transaction modal programmatically.                          |

The transaction modal opens automatically when `buildTx` is called. See [`@chettapay/core`](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-core) for `TransactionState` step details and the per-call `BuildOutcome` / `SignOutcome` / `SubmitOutcome` return types.

---

### Network

| Property     | Type                               | Description                           |
|--------------|------------------------------------|---------------------------------------|
| `network`    | `StellarNetwork`                   | Currently active network.             |
| `setNetwork` | `(network: StellarNetwork) => void` | Switches the active Stellar network. |

---

### Wallet Balance

| Property                 | Type                       | Description                                                              |
|--------------------------|----------------------------|--------------------------------------------------------------------------|
| `walletBalance`          | `WalletBalanceState`       | Current wallet balance state (reactive).                                |
| `refreshWalletBalance`   | `() => Promise<void>`      | Refreshes balances for the authenticated wallet. Drives `walletBalance`. |
| `openWalletBalanceModal` | `() => void`               | Opens the wallet balance modal.                                         |

> For an arbitrary public key / network, use `getClient().getWalletBalance(publicKey)` from `@chettapay/core`.

---

### Enabled assets & trustlines

| Property                 | Type                                                                          | Description                                                     |
|--------------------------|-------------------------------------------------------------------------------|-----------------------------------------------------------------|
| `enabledAssets`          | `EnabledAssetsState`                                                          | App-enabled assets paired with the wallet's trustline state.    |
| `refreshAssets`          | `() => Promise<void>`                                                         | Refreshes the enabled-assets state.                             |
| `setTrustline`           | `(asset: { code; issuer }, opts?: { limit?; sponsored? }) => Promise<TrustlineOutcome>` | Establish (omit `limit`) or remove (`limit: '0'`) a trustline. Pass `sponsored: true` so the app covers reserve + fee when eligible. |
| `openEnabledAssetsModal` | `() => void`                                                                 | Opens the enabled-assets / trustline modal.                     |

---

### Swap

| Property         | Type                                                            | Description                                              |
|------------------|-----------------------------------------------------------------|----------------------------------------------------------|
| `getSwapConfig`  | `() => Promise<SwapVenue[]>`                                    | Venues this app exposes (empty = swap disabled).         |
| `getSwapTokens`  | `() => Promise<SwapToken[]>`                                    | Curated "buy" token catalog.                             |
| `getSwapQuote`   | `(params: SwapQuoteParams) => Promise<SwapQuote[]>`            | Quotes ranked best-first.                                |
| `swap`           | `(quote: SwapQuote, opts?: { autoTrustline? }) => Promise<SubmitOutcome>` | Executes a quote; drives `tx`.                  |
| `openSwapModal`  | `() => void`                                                   | Opens the swap modal.                                    |

---

### Earn

| Property               | Type                                                    | Description                                          |
|------------------------|---------------------------------------------------------|------------------------------------------------------|
| `getEarnProviders`     | `() => Promise<EarnProviderId[]>`                       | Yield providers this app exposes (empty = disabled). |
| `getEarnOpportunities` | `(provider: EarnProviderId) => Promise<EarnOpportunity[]>` | Vaults/pools with live APY.                       |
| `getEarnPosition`      | `(params: EarnPositionParams) => Promise<EarnPosition>` | The wallet's position.                              |
| `earnDeposit`          | `(params: EarnTxParams) => Promise<SubmitOutcome>`      | Deposit into a vault/pool; drives `tx`.             |
| `earnWithdraw`         | `(params: EarnTxParams) => Promise<SubmitOutcome>`      | Withdraw from a vault/pool; drives `tx`.            |
| `openEarnModal`        | `() => void`                                            | Opens the Earn modal.                               |

---

### Transaction History

| Property            | Type             | Description                          |
|---------------------|------------------|--------------------------------------|
| `txHistory`         | `TxHistoryState` | Current tx history state (reactive). |
| `openTxHistoryModal` | `() => void`    | Opens the transaction history modal. |

---

### KYC

| Property       | Type                                                                                  | Description                       |
|----------------|---------------------------------------------------------------------------------------|-----------------------------------|
| `openKycModal` | `(options?: { country?: string; level?: KycLevel; onApproved?: () => void }) => void` | Opens the KYC verification modal. |

| Option       | Type         | Default   | Description                                                           |
|--------------|--------------|-----------|-----------------------------------------------------------------------|
| `country`    | `string`     | `'MX'`    | ISO 3166-1 alpha-2 country code to filter providers.                  |
| `level`      | `KycLevel`   | `'basic'` | Required KYC level: `'basic'`, `'intermediate'`, or `'enhanced'`.    |
| `onApproved` | `() => void` | —         | Callback invoked when the KYC verification is successfully approved.  |

---

### Ramps

| Property         | Type         | Description                        |
|------------------|--------------|------------------------------------|
| `openRampModal`  | `() => void` | Opens the fiat on/off-ramp widget. |

---

### Utilities

| Property    | Type                 | Description                                                            |
|-------------|----------------------|------------------------------------------------------------------------|
| `getClient` | `() => ChettaPayClient` | Returns the underlying `ChettaPayClient` instance for direct API access.  |
| `appConfig` | `ChettaPayConfig`       | Application configuration fetched from the ChettaPay Dashboard.          |
| `styles`    | `ChettaPayStyles`       | Resolved styles, merging remote config with any local overrides.       |

---

### Modal entry points

All ChettaPay modals are mounted inside `<ChettaPayProvider>` and controlled programmatically:

| Function                         | Description                             |
|----------------------------------|-----------------------------------------|
| `openLoginModal()`               | Opens the login modal.                  |
| `openTxModal()`                  | Opens the transaction modal.            |
| `openKycModal(options?)`         | Opens the KYC modal.                    |
| `openRampModal()`                | Opens the ramp widget.                  |
| `openTxHistoryModal()`           | Opens the transaction history modal.    |
| `openWalletBalanceModal()`       | Opens the wallet balance modal.         |
| `openSendModal()`                | Opens the send-payment modal.           |
| `openReceiveModal()`             | Opens the receive modal.                |
| `openEnabledAssetsModal()`       | Opens the enabled-assets / trustline modal. |
| `openSwapModal()`                | Opens the swap modal.                   |
| `openEarnModal()`                | Opens the Earn modal.                   |
| `openSessionsModal()`            | Opens the active-sessions modal.        |
| `openDistributionRulesModal()`   | Opens the distribution-rules modal.     |

---

## Components

### `<WalletButton>`

Pre-built button that handles the complete authentication flow. When logged out, opens the login modal. When logged in, shows the wallet address with a dropdown for balance, transaction history, and logout.

```tsx
import { WalletButton } from '@chettapay/react';

<WalletButton />
```

No props required. Appearance comes from your remote dashboard configuration (or the `appConfig` override passed to `<ChettaPayProvider>`), exposed as `styles` on `useChettaPay()`.

---

### `<KycModal>`

Pre-built KYC verification modal. Can be rendered directly when you need more control than `openKycModal()` provides.

```tsx
import { KycModal } from '@chettapay/react';

<KycModal
  onClose={() => setOpen(false)}
  country="US"
  level="basic"
  onApproved={() => console.log('KYC approved')}
/>
```

| Prop         | Type         | Default   | Description                                             |
|--------------|--------------|-----------|---------------------------------------------------------|
| `onClose`    | `() => void` | —         | **Required.** Called when the user dismisses the modal. |
| `country`    | `string`     | `'MX'`    | ISO 3166-1 alpha-2 country code to filter providers.    |
| `level`      | `KycLevel`   | `'basic'` | Required KYC level.                                     |
| `onApproved` | `() => void` | —         | Called when KYC is successfully approved.               |

---

### `<KycStatus>`

Displays the current KYC status for the authenticated user.

```tsx
import { KycStatus } from '@chettapay/react';

<KycStatus />
```

---

### `<RampWidget>`

Pre-built fiat on/off-ramp widget with support for on-ramp (fiat → crypto) and off-ramp (crypto → fiat) flows.

```tsx
import { RampWidget } from '@chettapay/react';

<RampWidget onClose={() => setOpen(false)} />
```

| Prop      | Type         | Description                                              |
|-----------|--------------|----------------------------------------------------------|
| `onClose` | `() => void` | **Required.** Called when the user dismisses the widget. |

---

### `<WalletBalanceModal>`

Displays the token balances of the authenticated wallet with a manual refresh option.

```tsx
import { WalletBalanceModal } from '@chettapay/react';

<WalletBalanceModal onClose={() => setOpen(false)} />
```

| Prop      | Type         | Description                                             |
|-----------|--------------|---------------------------------------------------------|
| `onClose` | `() => void` | **Required.** Called when the user dismisses the modal. |

---

## Template components

Template components handle rendering only — they receive all data and callbacks as props and contain no internal logic. Use them to build fully custom UI while reusing ChettaPay's layout and visual structure.

| Component                      | Description                                                  |
|--------------------------------|--------------------------------------------------------------|
| `<WalletButtonTemplate>`          | Wallet button (logged-out / logged-in) presentation.         |
| `<LoginModalTemplate>`            | Login provider selection and email OTP screens.              |
| `<KycModalTemplate>`              | KYC provider selection and verification screens.             |
| `<RampWidgetTemplate>`            | Ramp input, quote selection, and payment instruction screens.|
| `<TransactionModalTemplate>`      | Transaction details, signing, and result screens.            |
| `<TxHistoryModalTemplate>`        | Transaction history list screen.                             |
| `<WalletBalanceModalTemplate>`    | Wallet balance screen.                                       |
| `<EnabledAssetsModalTemplate>`    | Enabled-assets / trustline screen.                          |
| `<SendModalTemplate>`             | Send-payment screen.                                         |
| `<SwapModalTemplate>`             | Swap screen (exports `SwapAssetOption`).                    |
| `<ReceiveModalTemplate>`          | Receive (address / QR) screen.                              |
| `<SessionsModalTemplate>`         | Active-sessions list screen.                                |
| `<DistributionRulesModalTemplate>`| Claimable distribution rules screen.                        |

> Live (non-template) modal components are also exported for direct rendering: `SendModal`, `SwapModal`, `EarnModal`, `ReceiveModal`, `EnabledAssetsModal`, `WalletBalanceModal`, `SessionsModal`, `DistributionRulesModal`, plus `KycStatus`, `RouteDisplay`, and `TxStatusView`.

Import the corresponding `*Props` type for full type safety:

```tsx
import {
  TransactionModalTemplate,
  type TransactionModalTemplateProps,
  WalletBalanceModalTemplate,
  type WalletBalanceModalTemplateProps,
} from '@chettapay/react';
```

---

## Types

```typescript
import type {
  ChettaPayConfig,
  ChettaPayStyles,
  LoginButtonProps,
  AuthModalProps,
  KycStep,
  RampStep,
  TransactionModalTemplateProps,
  WalletBalanceModalTemplateProps,
  // re-exported from @chettapay/core so you can author custom login providers
  ChettaPayAuthProvider,
  AuthProviderContext,
} from '@chettapay/react';
```

Core types such as `WalletInfo`, `TransactionState`, `TxHistoryState`, `EnabledAssetsState`, `WalletBalanceContent`, `SwapQuote`, `EarnOpportunity`, `ChettaPayLoginOptions`, `StellarNetwork`, and `WalletType` are imported directly from `@chettapay/core`.