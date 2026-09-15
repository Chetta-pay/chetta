---
title: "@chettapay/core"
---

Framework-agnostic TypeScript client for ChettaPay. Use this package directly if you are not using React, or to build custom integrations on top of the ChettaPay platform.

**Version:** `0.10.1`

```bash
npm install @chettapay/core
```

---

## `ChettaPayClient`

```typescript
import { ChettaPayClient } from '@chettapay/core';

const chettapay = new ChettaPayClient({
  apiKey: 'pub_testnet_xxxxxxxxxxxxxxxxxxxx',
});
```

**Constructor options:**

| Option           | Type             | Default                          | Description                                                                |
|------------------|------------------|----------------------------------|----------------------------------------------------------------------------|
| `apiKey`         | `string`         | —                                | **Required.** Your ChettaPay publishable key.                                 |
| `stellarNetwork` | `StellarNetwork` | `'testnet'`                      | Target Stellar network: `'testnet'` or `'mainnet'`.                        |
| `baseUrl`        | `string`         | `'https://chettapay-api.vercel.app'`   | Override the ChettaPay API base URL. The SDK appends `/v1` to it. Useful for self-hosted deployments. |

> Additional options are supported for non-web runtimes and advanced use: `storage`, `keyManager`, `walletAdapters` (array — see [Wallet Adapters](https://chettapay-docs.vercel.app/docs/sdk-reference/wallet-adapters)), `requestTimeoutMs` (default `10000`), `submitTimeoutMs` (default `30000`), `retry`, `deviceLabel`, `visibilityProvider`, `openAuthUrl`, `oauthRedirectUri`, `passkey`, `logLevel`, `logger`, `onStorageDegrade`, and `maxIdleMs`. See the `ChettaPayClientConfig` type for the full list (React Native consumers must inject a `storage` adapter, and provide `openAuthUrl` for OAuth).

---

## Authentication

ChettaPay's built-in authentication providers are Google OAuth, GitHub OAuth, Email OTP, and external Stellar wallets (Freighter and Albedo are auto-registered). You can register more wallet providers — every Stellar Wallets Kit wallet, or Privy embedded wallets — through the `walletAdapters` config option; see [Wallet Adapters](https://chettapay-docs.vercel.app/docs/sdk-reference/wallet-adapters). A fifth path, passkey **Smart Wallet** login, is covered under Smart Wallets. All flows update `AuthState`, which can be observed via `onAuthStateChange`.

---

### `chettapay.login(options)`

Unified entry point for starting an authentication flow. For email, this initiates the session and sends the OTP code in a single call. For wallet providers, it connects and authenticates the wallet.

```typescript
import { WalletType } from '@chettapay/core';

// OAuth providers
chettapay.login({ provider: 'google' });
chettapay.login({ provider: 'github' });

// Email OTP (sends code automatically)
chettapay.login({ provider: 'email', email: 'user@example.com' });

// Built-in external wallets — provider is the wallet id
chettapay.login({ provider: WalletType.FREIGHTER }); // 'freighter-native'
chettapay.login({ provider: WalletType.ALBEDO });    // 'albedo-native'

// Any wallet registered via `walletAdapters` — provider is that adapter's id
chettapay.login({ provider: 'xbull' });  // Stellar Wallets Kit
chettapay.login({ provider: 'privy' });  // Privy embedded wallet
```

The `provider` for a wallet is the adapter's `type`. Built-in Freighter/Albedo
use the `WalletType` enum (`'freighter-native'` / `'albedo-native'`); wallets
added through [Wallet Adapters](https://chettapay-docs.vercel.app/docs/sdk-reference/wallet-adapters)
use their own ids (`'xbull'`, `'lobstr'`, `'privy'`, …).

| Option     | Type                                                     | Description                                     |
|------------|----------------------------------------------------------|-------------------------------------------------|
| `provider` | `'google' \| 'github' \| 'email' \| (string & {})`      | Authentication provider, or a registered wallet adapter's id. |
| `email`    | `string`                                                 | Required when `provider` is `'email'`.          |

---

### Email OTP — step-by-step flow

For use cases that require manual control over each step of the email OTP flow (e.g. custom UI), the following methods are available individually:

#### `chettapay.beginEmailLogin()`

Initializes a new email session. Transitions `AuthState` to `entering_email`.

```typescript
chettapay.beginEmailLogin();
```

#### `chettapay.sendEmailCode(email)`

Sends the OTP code to the provided email address. Must be called when `AuthState.step === 'entering_email'`.

```typescript
chettapay.sendEmailCode('user@example.com');
```

#### `chettapay.verifyEmailCode(code)`

Verifies the OTP code entered by the user and completes authentication. Must be called when `AuthState.step === 'entering_code'`.

```typescript
chettapay.verifyEmailCode('123456');
```

---

### `chettapay.cancelLogin()`

Cancels any in-progress authentication flow and resets `AuthState` to `idle`.

```typescript
chettapay.cancelLogin();
```

---

### `chettapay.logout()`

Signs out the current user, clears the session from storage, and resets all client state.

```typescript
chettapay.logout();
```

---

### `chettapay.getAuthState()`

Returns the current authentication state synchronously.

```typescript
const state = chettapay.getAuthState();

if (state.step === 'authenticated') {
  console.log(state.session);
}
```

---

### `chettapay.onAuthStateChange(callback)`

Subscribes to authentication state changes. The callback is invoked immediately with the current state, and on every subsequent change. Returns an unsubscribe function.

```typescript
const unsubscribe = chettapay.onAuthStateChange((state) => {
  if (state.step === 'authenticated') {
    console.log('Logged in:', state.session);
  }
});

// Later:
unsubscribe();
```

**`AuthState` steps:**

| Step                    | Description                                              |
|-------------------------|----------------------------------------------------------|
| `idle`                  | No active session or flow.                               |
| `creating_session`      | Creating a client session on the server.                 |
| `entering_email`        | Waiting for the user to provide their email address.     |
| `sending_email`         | Sending the OTP code to the user's email.                |
| `entering_code`         | Waiting for the user to enter the OTP code.              |
| `verifying_email_code`  | Verifying the submitted OTP code.                        |
| `opening_oauth`           | Opening the OAuth provider window.                       |
| `connecting_wallet`       | Connecting to the external wallet extension.             |
| `signing_wallet_challenge`| The wallet is counter-signing the SEP-10 challenge.      |
| `wallet_not_installed`    | The requested wallet extension is not installed.         |
| `authenticating_wallet`   | Authenticating with the connected wallet.                |
| `creating_passkey`        | Running the passkey (Smart Wallet) device ceremony.      |
| `deploying_smart_account` | Deploying the passkey C-address on-chain (new users).    |
| `authenticating`          | Finalizing authentication with the ChettaPay server.        |
| `authenticated`           | User is authenticated. `session` and `verified` are set. |
| `error`                   | An error occurred. `message` and `errorCode` are set.    |

---

## Network

### `chettapay.getNetwork()`

Returns the currently active Stellar network.

```typescript
const network = chettapay.getNetwork(); // 'testnet' | 'mainnet'
```

---

### `chettapay.setNetwork(network)`

Switches the active Stellar network.

```typescript
chettapay.setNetwork('mainnet');
```

---

### `chettapay.onNetworkStateChange(callback)`

Subscribes to network state changes. Returns an unsubscribe function.

```typescript
const unsubscribe = chettapay.onNetworkStateChange((state) => {
  if (state.step === 'connected') {
    console.log('Network:', state.network);
  }
});
```

---

## Transactions

ChettaPay handles transaction building and signing through a state machine. Use `onTransactionStateChange` to observe progress in your UI.

### `chettapay.buildTx(operation, params, options?)`

Builds an unsigned Stellar transaction on the server. Transitions `TransactionState` through `building` → `built` (or `error`).

```typescript
await chettapay.buildTx('payment', {
  destination: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  amount: '10.00',
  asset: { type: 'credit_alphanum4', code: 'USDC', issuer: 'GABC...' },
});
```

| Parameter   | Type              | Description                              |
|-------------|-------------------|------------------------------------------|
| `operation` | `string`          | Stellar operation type (e.g. `payment`). |
| `params`    | `object`          | Operation-specific parameters.           |
| `options`   | `object`          | Optional build-time overrides.           |

---

### `chettapay.signAndSubmitTx(unsignedXdr)`

Signs and submits a previously built transaction. For custodial wallets (social/email login), signing is performed server-side. For external wallets (Freighter/Albedo), signing is performed client-side and submitted directly to Horizon.

Must be called when `TransactionState.step === 'built'`.

```typescript
const state = chettapay.getTransactionState();

if (state?.step === 'built') {
  await chettapay.signAndSubmitTx(state.buildData.unsignedXdr);
}
```

---

### `chettapay.signAuthEntry(entryXdr, { validUntilLedger })`

Signs a single Soroban `SorobanAuthorizationEntry` — the user's authorization on its own, without a transaction envelope. Use it when your own contract is the transaction source (it sponsors the gas and submits), and all it needs from the user is consent to the invocation.

For **external wallets** the adapter signs the entry directly. For **custodial wallets** ChettaPay signs server-side, and only if every contract and function in the entry's invocation tree is allowlisted for your app under **Treasury → [Auth Policy](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/auth-policy)**. That allowlist is what keeps the custodial signer from being usable as a signing oracle, so an unconfigured app signs nothing. **Passkey smart accounts** (C-address sessions) are not supported by this method in the current build: they sign auth entries through their passkey ceremony, which this call does not run, so it resolves to `{ status: 'error' }` rather than signing with the wrong key.

`validUntilLedger` is the absolute ledger the signature expires at — compute it from the network's latest ledger. Your app's validity window caps how far ahead it may be (120 ledgers by default, 300 at most).

```typescript
const result = await chettapay.signAuthEntry(entryXdr, { validUntilLedger: latestLedger + 100 });

if (result.status === 'signed') {
  await myBackend.settle(result.signedAuthEntry);
} else {
  console.error(result.details); // e.g. SOROBAN_AUTH_FUNCTION_NOT_ALLOWED
}
```

Resolves to `{ status: 'signed'; signedAuthEntry: string }` or `{ status: 'error'; details?: string }` — like the other transaction methods, it does not throw on a denial. The denial codes are listed under [Error Codes](https://chettapay-docs.vercel.app/docs/sdk-reference/error-codes).

---

### `chettapay.getTransactionState()`

Returns the current transaction state synchronously, or `null` if no transaction is in progress.

```typescript
const state = chettapay.getTransactionState();
```

---

### `chettapay.onTransactionStateChange(callback)`

Subscribes to transaction state changes. Returns an unsubscribe function.

```typescript
const unsubscribe = chettapay.onTransactionStateChange((state) => {
  if (state.step === 'success') {
    console.log('Transaction hash:', state.hash);
  }
});
```

**`TransactionState` steps:**

| Step                          | Description                                                          |
|-------------------------------|---------------------------------------------------------------------|
| `idle`                        | No transaction in progress.                                         |
| `building`                    | Building the transaction on the server.                             |
| `built`                       | Transaction built. `buildData.unsignedXdr` is available.            |
| `signing`                     | Signing the built transaction.                                      |
| `signed`                      | Signed. `signedXdr` is available.                                   |
| `submitting`                  | Submitting the signed transaction.                                  |
| `signing-submitting`          | Custodial atomic sign+submit (server swallows the boundary).        |
| `building-signing-submitting` | Custodial atomic build+sign+submit (`runTx` / `buildAndSignAndSubmitTx`). |
| `submitted`                   | Accepted by Horizon; awaiting ledger confirmation. `hash` is set.   |
| `success`                     | Transaction confirmed. `hash` is available.                         |
| `error`                       | Transaction failed. Carries `phase`, and optionally `code` / `message` / `details`. |

---

## Wallet Balance

### `chettapay.refreshBalance()`

Fetches the current balances for the **authenticated** wallet and drives the wallet-balance state machine (takes no arguments).

```typescript
await chettapay.refreshBalance();
```

---

### `chettapay.getWalletBalance(publicKey, network?)`

Fetches balances for an **arbitrary** public key without touching the balance state machine. Returns the balance content directly.

```typescript
const { balances } = await chettapay.getWalletBalance('GXXX...');
```

---

### `chettapay.getWalletBalanceState()`

Returns the current wallet balance state synchronously.

```typescript
const state = chettapay.getWalletBalanceState();

if (state.step === 'loaded') {
  console.log(state.data.balances);
}
```

---

### `chettapay.onWalletBalanceStateChange(callback)`

Subscribes to wallet balance state changes. Returns an unsubscribe function.

```typescript
const unsubscribe = chettapay.onWalletBalanceStateChange((state) => {
  if (state.step === 'loaded') {
    console.log(state.data.balances);
  }
});
```

---

## Transaction History

### `chettapay.fetchTxHistory(params?)`

Fetches paginated transaction history for the authenticated wallet.

```typescript
await chettapay.fetchTxHistory({
  limit: 20,
  offset: 0,
});
```

| Option   | Type     | Default | Description                                                        |
|----------|----------|---------|--------------------------------------------------------------------|
| `limit`  | `number` | —       | Number of records to return.                                       |
| `offset` | `number` | `0`     | Offset for pagination (history uses offset-based paging).          |

> Only transactions submitted through ChettaPay appear here. A record reads `PENDING` immediately after build and updates to `SUCCESS` or `FAILED` once submitted. Each record exposes `id`, `hash`, `network`, `status`, `operation`, `summary`, `feeXlm`, `resultCode`, and `createdAt`.

---

### `chettapay.getTxHistoryState()`

Returns the current transaction history state synchronously.

```typescript
const state = chettapay.getTxHistoryState();

if (state.step === 'loaded') {
  console.log(state.data.records);
}
```

---

### `chettapay.onTxHistoryStateChange(callback)`

Subscribes to transaction history state changes. Returns an unsubscribe function.

```typescript
const unsubscribe = chettapay.onTxHistoryStateChange((state) => {
  if (state.step === 'loaded') {
    console.log(state.data.records);
  }
});
```

---

## KYC

ChettaPay provides a KYC (Know Your Customer) flow that integrates with third-party identity verification providers.

### `chettapay.getKycProviders(country)`

Returns the list of available KYC providers for the given country code.

```typescript
const providers = await chettapay.getKycProviders('US');
```

---

### `chettapay.getKycStatus(providerId?)`

Returns the current KYC status for the authenticated user. Optionally scoped to a specific provider. Resolves to an object — read `.status` for the value.

```typescript
const { status, level, providerId, expiresAt } = await chettapay.getKycStatus();
// status: 'none' | 'pending' | 'approved' | 'rejected'
```

---

### `chettapay.startKyc(body)`

Initiates a KYC verification session with the specified provider.

```typescript
const session = await chettapay.startKyc({
  providerId: 'provider_id',
  level: 'basic',
  redirectUrl: 'https://yourapp.com/kyc/callback',
});
```

---

### `chettapay.resolveKyc(providerId, level?)`

Resolves the outcome of a completed KYC session.

```typescript
await chettapay.resolveKyc('provider_id', 'basic');
```

---

### `chettapay.pollKycStatus(providerId, opts?)`

Polls the KYC status until it reaches a terminal state (`approved` or `rejected`), or until the timeout is exceeded.

```typescript
const finalStatus = await chettapay.pollKycStatus('provider_id', {
  intervalMs: 2000,
  timeoutMs: 60000,
});
```

| Option       | Type     | Description                               |
|--------------|----------|-------------------------------------------|
| `intervalMs` | `number` | Polling interval in milliseconds.         |
| `timeoutMs`  | `number` | Maximum wait time before throwing.        |

**`KycStatus` values:** `'none'` · `'pending'` · `'approved'` · `'rejected'`

**`KycLevel` values:** `'basic'` · `'intermediate'` · `'enhanced'`

---

## Ramps

ChettaPay supports on-ramp (fiat → crypto) and off-ramp (crypto → fiat) flows through integrated third-party providers.

### `chettapay.getRampsQuote(query)`

Returns available quotes for a ramp operation.

```typescript
const quotes = await chettapay.getRampsQuote({
  direction: 'onramp',
  fiatCurrency: 'USD',
  cryptoAsset: 'USDC',
  amount: '100',
});
```

Each quote carries the bounds of the **route** and, separately, what applies to
**this user**:

| Field               | Meaning                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `minAmount` / `maxAmount` | What the route will serve. Same for every user.                   |
| `fiatAmount`        | The fiat this quote actually settles — **not always what you asked for**. Display this one. |
| `cryptoAmount`      | The crypto the wallet will be **debited** on an off-ramp. `null` on an on-ramp. Fund the wallet with at least this — see below. |
| `availableAmount`   | The fiat this user's wallet balance covers on an off-ramp. `null` when there is no answer to give: an on-ramp, a provider without its own FX rate, or a balance ChettaPay cannot read. `null` never means zero — your app may hold the balance elsewhere and fund the wallet before the user signs. |
| `expiresAt`         | When the quote stops being accepted. **This is the deadline to count down.** |
| `providerExpiresAt` | When the underlying provider's own quote dies, or `null`. Informational — see below. |

#### Quote expiry: count down `expiresAt`, not `providerExpiresAt`

A ChettaPay quote is accepted for **15 minutes**. Past `expiresAt`, starting a ramp
with that `quoteId` fails with `SDK_RAMPS_QUOTE_EXPIRED` and you request a new
one.

Providers run on much shorter clocks — Stereum's own quote lasts about a minute,
Etherfuse's about two — and `providerExpiresAt` reports that when the provider
publishes it. **You do not have to beat it.** When you start the ramp, ChettaPay
re-quotes the provider under the same parameters as the quote you were shown,
and confirms the order against that fresh quote. A provider quote going stale
while your user fills in a bank form is absorbed server-side and never reaches
you.

That matters most on off-ramps, where the form asks for an account number, a
bank, a holder name and a document: nobody completes it inside a provider's
one-minute window, and they do not have to.

`providerExpiresAt` is there for transparency — showing which provider clock is
running, or logging it — not as something to enforce.

#### The amount you asked for is not always the amount quoted

Providers that price by the crypto side land *near* your figure rather than on
it. Ask to receive 12 BOB from Stereum and the quote settles **12.13**. That is
the number it will really pay, and it is what `fiatAmount` reports — show it,
because the user will see 12.13 arrive in their bank.

It also matters for arithmetic: `rate` is published against `fiatAmount`, so
dividing *your* requested figure by it gives a different answer.

```ts
// 12 / 10.734513274336285  ->  1.1178…  ->  1.12   ✗ a cent short
// 12.13 / 10.734513274336285  ->  1.13          ✓ what will be charged
```

Which is why you should not divide at all — read `cryptoAmount`.

#### Funding an off-ramp: use `cryptoAmount`

An off-ramp is paid from the wallet, so the crypto has to be there before you
start it. `cryptoAmount` is that figure, and it is **fixed at quote time**: the
order charges exactly it, so moving precisely this much into the wallet is
always enough. If your app holds the balance elsewhere — a lending position, a
vault, a savings product — this is the number to withdraw.

Do not derive it by dividing the fiat amount by `rate`. `rate` is published
against an amount already rounded to the cent, so the division cannot recover
the charge and can land you a cent short; the ramp then fails with
`SDK_RAMPS_INSUFFICIENT_BALANCE`.

The trade-off that buys you a fixed charge: the **payout** absorbs rate movement
instead. Between the quote and the order, ChettaPay re-quotes the provider for the
same crypto amount, so the fiat that arrives can differ slightly from the figure
you displayed. Read the settled amounts back from the ramp transaction rather
than assuming the quote's.

---

### `chettapay.createOnRamp(body)`

Creates an on-ramp transaction (fiat → crypto).

```typescript
const onramp = await chettapay.createOnRamp({ ... });
console.log(onramp.depositInstructions);
// { txId, provider, status, kycUrl?, pendingSignature?, depositInstructions }
```

---

### `chettapay.createOffRamp(body)`

Creates an off-ramp transaction (crypto → fiat).

```typescript
const offramp = await chettapay.createOffRamp({ ... });
```

---

#### Retrying a start that timed out

`createOnRamp` / `createOffRamp` are safe to retry with the same `quoteId`. A
quote is consumed once, so a repeat does not open a second order or charge
twice: it answers with the transaction the first call already produced, carrying
its current `status` and `stellarTxHash`.

That matters because a timeout is not a failure. The SDK abandons a request
after 10 seconds by default, and a dropped connection can cut the answer after
the server has committed — on an off-ramp, after the crypto has left the wallet.
Treating that as a failed withdrawal is wrong, and there is no other way to find
the transaction, because its id came back in the answer you never received.

```ts
// On a network error, ask again with the same quoteId rather than giving up.
try {
  return await chettapay.createOffRamp(body);
} catch (e) {
  if (isNetworkError(e)) return await chettapay.createOffRamp(body); // replays, never duplicates
  throw e;
}
```

A genuine first failure still fails: nothing was created, so the retry runs the
start for real.

---

### `chettapay.getRampTransaction(txId)`

Returns the current state of a ramp transaction by ID.

```typescript
const tx = await chettapay.getRampTransaction('tx_id');
console.log(tx.status);
```

---

### `chettapay.pollRampTransaction(txId, opts?)`

Polls a ramp transaction until it reaches a terminal status.

```typescript
const finalStatus = await chettapay.pollRampTransaction('tx_id', {
  intervalMs: 3000,
  timeoutMs: 120000,
});
```

| Option       | Type     | Description                        |
|--------------|----------|------------------------------------|
| `intervalMs` | `number` | Polling interval in milliseconds.  |
| `timeoutMs`  | `number` | Maximum wait time before throwing. |

---

## App Config

### `chettapay.getAppConfig()`

Returns the application configuration associated with your API key, as configured in the ChettaPay Dashboard.

```typescript
const config = await chettapay.getAppConfig();
```

---

## One-shot transactions

For build → sign → submit in a single call, use `runTx` (an alias of
`buildAndSignAndSubmitTx`). Both drive the same `TransactionState` machine as the
split calls and resolve to a `SubmitOutcome` (`{ status: 'success' | 'pending' | 'error', … }`).

```typescript
const outcome = await chettapay.runTx('payment', {
  destination: 'GXXX...',
  amount: '10.00',
  asset: { type: 'credit_alphanum4', code: 'USDC', issuer: 'GABC...' },
});
if (outcome.status === 'error') console.error(outcome.details, outcome.resultCode);
```

Lower-level building blocks are also available: `signTx(unsignedXdr)` (external
wallets only), `submitTx(signedXdr)`, `getTxStatus(hash)`, `createAccount()`, and
`resetTransactionState()`.

---

## Enabled assets & trustlines

The app's dashboard-enabled assets paired with the authenticated wallet's
on-chain trustline state.

- `chettapay.getEnabledAssetsState()` — current state snapshot.
- `chettapay.refreshAssets()` — refresh the enabled-assets state machine.
- `chettapay.onEnabledAssetsStateChange(cb)` — subscribe; returns an unsubscribe fn.
- `chettapay.setTrustline(asset, opts?)` — establish (omit `limit`) or remove
  (`limit: '0'`) a trustline. Pass `{ sponsored: true }` so the app covers the
  reserve + fee when eligible; otherwise the user's wallet pays. Returns a
  `TrustlineOutcome`.

```typescript
await chettapay.setTrustline({ code: 'USDC', issuer: 'GABC...' }, { sponsored: true });
```

---

## Swap

Multi-venue asset swaps (SDEX / AMM). Empty `getSwapConfig()` means swap is
disabled for the app — hide the UI.

- `chettapay.getSwapConfig()` → `Promise<SwapVenue[]>` — venues this app exposes.
- `chettapay.getSwapTokens()` → `Promise<SwapToken[]>` — curated "buy" token catalog.
- `chettapay.getSwapQuote(params)` → `Promise<SwapQuote[]>` — quotes ranked best-first.
- `chettapay.swap(quote, opts?)` → `Promise<SubmitOutcome>` — execute a quote
  (establishes the buy-asset trustline first when needed). Drives `TransactionState`.

---

## Earn

Yield vaults (DeFindex) and lending pools (Blend). Empty `getEarnProviders()`
means Earn is disabled — hide the UI.

- `chettapay.getEarnProviders()` → `Promise<EarnProviderId[]>`.
- `chettapay.getEarnOpportunities(provider)` → `Promise<EarnOpportunity[]>` — vaults/pools with live APY.
- `chettapay.getEarnPosition(params)` → `Promise<EarnPosition>` — the wallet's position.
- `chettapay.earnDeposit(params)` → `Promise<SubmitOutcome>`.
- `chettapay.earnWithdraw(params)` → `Promise<SubmitOutcome>`.

---

## Token distribution

- `chettapay.listDistributionRules()` → `Promise<DistributionRule[]>` — claimable rules for the app.
- `chettapay.claimDistributionRule(body)` → claims a rule for the authenticated user.

---

## Sessions

Manage the authenticated user's active sessions (devices).

- `chettapay.listSessions()` → `Promise<SessionInfo[]>`.
- `chettapay.getSessionsState()` / `chettapay.fetchSessions()` / `chettapay.onSessionsStateChange(cb)` — the sessions state machine.
- `chettapay.revokeSession(familyId)` — revoke one session.
- `chettapay.logout({ everywhere: true })` or `chettapay.logoutEverywhere()` — sign out everywhere.

---

## Smart Wallets (passkey)

Passkey-backed Soroban **C-address** login. Requires a `passkey` ceremony in
`ChettaPayClientConfig` (`@chettapay/react` supplies one via `@simplewebauthn/browser`;
browser-only for now).

- `chettapay.loginSmartWallet()` — log in with an existing passkey wallet.
- `chettapay.createSmartWallet()` — create + deploy a new passkey C-address.

See [Smart Wallets](https://chettapay-docs.vercel.app/docs/smart-wallets/overview) for the full flow.

---

## Types

```typescript
import type {
  ChettaPayClientConfig,
  ChettaPayLoginOptions,
  AuthState,
  AuthErrorCode,
  NetworkState,
  TransactionState,
  TxBuildBody,
  TxBuildContent,
  TxHistoryState,
  TxHistoryParams,
  TxHistoryRecord,
  WalletBalanceState,
  WalletBalanceRecord,
  KycLevel,
  KycStatus,
  KycFlow,
  KycProvider,
  KycStartBody,
  KycStartResponse,
  RampsQuoteQuery,
  RampQuote,
  RampsQuoteResponse,
  RampsOnrampBody,
  RampsOnrampResponse,
  RampsOfframpBody,
  RampsOfframpResponse,
  RampsTransactionResponse,
  RampTxStatus,
  RampDirection,
  SwapVenue,
  SwapToken,
  SwapQuote,
  SwapQuoteParams,
  EarnProviderId,
  EarnOpportunity,
  EarnPosition,
  SessionInfo,
  DistributionRule,
  WalletInfo,
  ChettaPayFlowError,
} from '@chettapay/core';

import { WalletType } from '@chettapay/core';
```
