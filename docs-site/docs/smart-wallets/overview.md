---
title: "Smart Wallets (C-Addresses)"
---

**Smart wallets** let a user onboard with a **passkey** (WebAuthn — Face ID / Touch ID / a security key) that controls a Stellar **smart contract account**, a *C-address*, instead of a classic ed25519 account (a *G-address*). The account's authorization logic lives in a Soroban contract rather than in a fixed signature scheme.

Unlike ChettaPay's custodial login (social / email → platform-custodied G-address), a smart wallet is a **non-custodial, passkey-controlled** account: the user signs with their device credential, and ChettaPay sponsors the on-chain deploy and fees.

> **Availability:** implemented in `@chettapay/core` / `@chettapay/react` **0.10.1**. It is **browser-only** for now — `@chettapay/react` wires the WebAuthn ceremony automatically on web; React Native needs a native passkey provider. Some features (Swap, Earn, and manual trustlines) are **not yet supported** for smart wallets.

---

## How you use it

Smart wallet login is a distinct entry point — there is no `walletType` switch. Turn on the option and the SDK exposes it:

1. **Enable it in the dashboard:** **Build → Branding → Smart Wallet (passkey)**. This surfaces a passkey option in the login modal (`styles.smartWallet`).
2. **From the built-in modal:** `openLoginModal()` then renders a **Smart Wallet (passkey)** option with two actions — sign in (returning user) and create (new user).
3. **Headless:** call the client directly:

```typescript
const chettapay = useChettaPay().getClient();

chettapay.createSmartWallet(); // new user: passkey create() + sponsored C-address deploy
chettapay.loginSmartWallet();  // returning user: passkey get()
```

Both drive `AuthState` (`creating_passkey` → `deploying_smart_account` → `authenticated`). After login the wallet is:

```typescript
useChettaPay().wallet;
// { custody: 'smart', address: 'C…', provider: 'passkey', existsOnStellar, fundingMode }
```

Payments use the **same** transaction API as any other wallet (`runTx` / `buildTx` + `signAndSubmitTx`) — for a smart wallet the SDK signs the Soroban **auth entries** with the passkey credential under the hood.

---

## In this section

| <br />                                                          | <br />                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| [C-Address Quickstart](https://chettapay-docs.vercel.app/docs/smart-wallets/quickstart-c-address)                  | Passkey sign-up through to a payment-ready smart wallet      |
| [G-Addresses vs C-Addresses](https://chettapay-docs.vercel.app/docs/smart-wallets/migration-g-to-c)                | What differs (and what doesn't) between the two account types |
| [How the C-Address Lifecycle Works](https://chettapay-docs.vercel.app/docs/smart-wallets/c-address-lifecycle)      | Deploy, rent/TTL, the SAC, and auth-entry signing under the hood |

## How it differs from classic accounts at a glance

| Aspect           | G-address (custodial, classic) | C-address (passkey smart wallet)   |
| ---------------- | ------------------------------ | ---------------------------------- |
| Identifier       | Starts with `G`                | Starts with `C`                    |
| Login            | Social / email (custodial)     | Passkey (WebAuthn)                 |
| Authorization    | Native ed25519 signature       | `__check_auth` in the contract     |
| Creation         | `createAccount` operation      | `InvokeHostFunction` (contract deploy) |
| Holding an asset | `changeTrust` trustline        | SAC balance (no classic trustline) |
| Keeping it alive | XLM reserve (one-time)         | Storage rent + TTL (recurring)     |

See [How the C-Address Lifecycle Works](https://chettapay-docs.vercel.app/docs/smart-wallets/c-address-lifecycle) for the full breakdown.
