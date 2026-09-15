---
title: "C-Address Quickstart"
---

This guide takes a user from zero to a **payment-ready smart wallet** on Stellar. The user signs in with a **passkey** (Face ID / Touch ID / security key) and ChettaPay handles the rest: deploying the contract account (C-address), sponsoring fees, and reaching a state where the wallet can send and receive assets. The user never sees a seed phrase or manages a private key.

> **Browser-only.** The passkey ceremony runs via WebAuthn in the browser. `@chettapay/react` wires it automatically; a raw `@chettapay/core` setup must supply a `passkey` (and `passkeySign`) ceremony. React Native support needs a native passkey provider.

> For how the lifecycle works under the hood, see the [C-Address Lifecycle](https://chettapay-docs.vercel.app/docs/smart-wallets/c-address-lifecycle).

## What you'll build

A passkey login flow that ends with a deployed C-address, verifiable on Stellar Expert.

## 1. Enable Smart Wallet in the dashboard

Go to **Build → Branding** and turn on **Smart Wallet (passkey)**. This adds the passkey option (`styles.smartWallet`) to the SDK login modal.

## 2. Install and mount the provider

```bash
npm install @chettapay/react
```

```tsx
import { ChettaPayProvider } from '@chettapay/react';

export default function Root() {
  return (
    <ChettaPayProvider client={{ apiKey: process.env.NEXT_PUBLIC_CHETTAPAY_PUBLISHABLE_KEY! }}>
      <App />
    </ChettaPayProvider>
  );
}
```

`@chettapay/react` injects the browser passkey ceremony for you, so `createSmartWallet()` / `loginSmartWallet()` work out of the box on web.

## 3. Sign the user in with a passkey

The simplest path is the built-in modal — with Smart Wallet enabled it shows a **passkey** option (create for new users, sign-in for returning ones):

```tsx
'use client';
import { useChettaPay } from '@chettapay/react';

export function LoginButton() {
  const { isAuthenticated, wallet, openLoginModal } = useChettaPay();

  if (isAuthenticated) return <p>✓ Smart wallet ready — {wallet?.address}</p>;
  return <button onClick={openLoginModal}>Sign in</button>;
}
```

For a headless flow, call the client directly:

```tsx
'use client';
import { useChettaPay } from '@chettapay/react';

export function PasskeyButtons() {
  const { getClient } = useChettaPay();
  return (
    <>
      <button onClick={() => getClient().createSmartWallet()}>Create passkey wallet</button>
      <button onClick={() => getClient().loginSmartWallet()}>Sign in with passkey</button>
    </>
  );
}
```

`createSmartWallet()` runs the WebAuthn `create()` ceremony and deploys a sponsored C-address; `loginSmartWallet()` runs `get()` for a returning user. Both settle `AuthState` to `authenticated`.

## 4. (Optional) Follow the flow in your UI

Progress is exposed through `AuthState` (there is no separate `walletProgress` event). Subscribe with `onAuthStateChange`:

```typescript
getClient().onAuthStateChange((state) => {
  // state.step: 'creating_passkey' | 'deploying_smart_account' | 'authenticating' | 'authenticated' | 'error'
});
```

| Step                      | Meaning                                             |
|---------------------------|-----------------------------------------------------|
| `creating_passkey`        | Running the device WebAuthn ceremony                |
| `deploying_smart_account` | Deploying the sponsored C-address on-chain (new user) |
| `authenticating`          | Finalizing authentication with the ChettaPay server    |
| `authenticated`           | Session ready; `wallet.custody === 'smart'`         |

## 5. Verify on-chain

The deployed contract is real and permanent. Build a verification link from the C-address:

```typescript
const { wallet } = useChettaPay();
const contractUrl = `https://testnet.stellar.expert/contract/${wallet?.address}`;
```

## 6. Send a payment

Once authenticated, send assets with the **same** transaction API as any wallet — the SDK signs the Soroban auth entries with the passkey credential internally:

```typescript
await getClient().runTx('payment', {
  destination: 'GDESTINATION...', // G-address or C-address
  amount: '10.00',
  asset: { type: 'credit_alphanum4', code: 'USDC', issuer: 'GA5ZSE...' },
});
```

> Swap, Earn, and manual trustlines are **not yet supported** for smart wallets.

## Next steps

- [G-Addresses vs C-Addresses](https://chettapay-docs.vercel.app/docs/smart-wallets/migration-g-to-c)
- [How the C-Address Lifecycle Works](https://chettapay-docs.vercel.app/docs/smart-wallets/c-address-lifecycle)
