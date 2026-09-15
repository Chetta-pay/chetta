---
title: "G-Addresses vs C-Addresses"
---

ChettaPay supports two account types side by side: **custodial G-addresses** (social / email login) and **passkey C-addresses** (smart wallets). This page covers how they relate, what your integration shares between them, and what differs.

> There is **no `walletType` switch and no in-place upgrade.** An account's custody is fixed when it is created: a user who signs up with a passkey gets a C-address; a user who signs up with social / email gets a custodial G-address. You cannot convert one into the other — they are different account types.

## Offering both

You don't pick one globally. You enable the login methods you want, and each user's choice determines their account type:

- Turn on **Build → Branding → Smart Wallet (passkey)** to show the passkey option.
- Keep social / email enabled for custodial G-address users.

The login modal then shows both; some users end up with C-addresses, others with G-addresses. Existing G-address users are unaffected.

## What stays the same

- **The transaction API.** `runTx` / `buildTx` + `signAndSubmitTx` have the same shape for both. For a smart wallet the SDK signs Soroban auth entries with the passkey credential instead of calling the custodial signer.
- **Fee sponsorship.** ChettaPay sponsors fees for both; you don't fund users manually.
- **The session / hook surface.** `useChettaPay()`, `wallet`, balances, and tx history work the same.

## What differs

### 1. The address format

`wallet.address` starts with `C` for a smart wallet instead of `G`. If you store or display addresses, don't assume a `G` prefix.

### 2. Custody discriminator

`wallet.custody` distinguishes the account types (and `wallet.provider` narrows further):

```typescript
const { wallet } = useChettaPay();
// custody: 'internal' → custodial G-address (provider: 'google' | 'github' | 'email' | …)
// custody: 'smart'    → passkey C-address (provider: 'passkey')
// custody: 'external' → user-connected wallet via an adapter
const isSmart = wallet?.custody === 'smart';
```

### 3. Onboarding is a contract deploy

Custodial onboarding creates an account (and optionally trustlines). Smart onboarding runs a passkey ceremony and deploys a contract, extending its TTL. The auth states differ — `creating_passkey` / `deploying_smart_account` — see the [lifecycle explainer](https://chettapay-docs.vercel.app/docs/smart-wallets/c-address-lifecycle).

### 4. Assets use the SAC, not trustlines

C-addresses don't use classic trustlines; they hold assets through the **Stellar Asset Contract (SAC)**. The SDK routes payments through the SAC for you. **Manual trustline management (`setTrustline`) is not applicable to smart wallets** and returns an error.

### 5. Feature support today

Some SDK surfaces are **not yet available** for smart wallets: **Swap**, **Earn**, and manual trustlines. Payments (send/receive) and balances work. Plan around these limits if you enable passkey login.

## When to use which

- **Custodial G-addresses** — the broadest reach; social / email onboarding with zero device requirements. Fully supported across all SDK features.
- **Passkey C-addresses** — non-custodial, device-bound, programmable authorization; browser-only today, with Swap/Earn/trustlines still to come.

## Next steps

- [C-Address Quickstart](https://chettapay-docs.vercel.app/docs/smart-wallets/quickstart-c-address)
- [How the C-Address Lifecycle Works](https://chettapay-docs.vercel.app/docs/smart-wallets/c-address-lifecycle)
