---
title: "Quickstart"
---

Get from zero to a working Stellar wallet with USDC payments in under 10 minutes.

**Requirements:** Node.js 20+ · React 18+ · A publishable key from [chettapay-dashboard.vercel.app](https://chettapay-dashboard.vercel.app)

> SDK requests are rate-limited per API key — plenty of headroom for development. See [API Keys](https://chettapay-docs.vercel.app/docs/getting-started/api-keys).

---

## 1. Install

```bash
npm install @chettapay/react
```

This includes `@chettapay/core` as a peer dependency. If you are not using React:

```bash
npm install @chettapay/core
```

---

## 2. Add `ChettaPayProvider`

Wrap your app root once. Every child component can then call `useChettaPay()`.

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

`ChettaPayProvider` already includes `"use client"` internally. Components that call `useChettaPay()` need `"use client"` because they use React hooks — that is a React requirement, not specific to ChettaPay.

#### Options

The `client` prop accepts either a `ChettaPayClientConfig` (the provider builds the client for you) or a pre-built `ChettaPayClient` instance.

| Prop       | Type                              | Default | Description                                              |
| ---------- | --------------------------------- | ------- | ------------------------------------------------------- |
| `client`   | `ChettaPayClientConfig \| ChettaPayClient` | —    | **Required.** Client config (`{ apiKey }`) or instance. |
| `appConfig` | `ChettaPayConfig`                   | —       | Local override of the remote dashboard config/styles.   |

See [`@chettapay/react`](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-react) for the full prop list (`appConfig`, `adapters`, `onStorageDegrade`).

#### Not using React?

```typescript
import { ChettaPayClient } from '@chettapay/core';

const chettapay = new ChettaPayClient({
  apiKey: process.env.NEXT_PUBLIC_CHETTAPAY_PUBLISHABLE_KEY!,
  stellarNetwork: 'testnet',
});
```

---

## 3. Login and create a wallet

```tsx
'use client';

import { useChettaPay } from '@chettapay/react';

export function LoginButton() {
  const { isAuthenticated, wallet, login } = useChettaPay();

  if (isAuthenticated) return <p>✓ Wallet ready — {wallet?.address}</p>;

  return (
    <button onClick={() => login({ provider: 'google' })}>
      Continue with Google
    </button>
  );
}
```

When `login()` is called, ChettaPay:

1. Authenticates the user via OAuth (Google or GitHub) or email OTP
2. Creates a Stellar G-address on-chain
3. Encrypts the private key with AWS KMS
4. Enables trustlines for all assets configured in your Dashboard (if none configured, no trustlines are set up)
5. Funds the wallet based on your configured [funding mode](https://chettapay-docs.vercel.app/docs/core-concepts/funding-modes)

The user never sees a seed phrase, a wallet address, or a trustline prompt.

---

## 4. Send USDC

```tsx
'use client';

import { useChettaPay } from '@chettapay/react';

export function SendButton() {
  const { runTx } = useChettaPay();

  return (
    <button
      onClick={() =>
        runTx('payment', {
          destination: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          amount: '10.00',
          asset: { type: 'credit_alphanum4', code: 'USDC', issuer: 'GA5Z...' },
        })
      }
    >
      Send 10 USDC
    </button>
  );
}
```

`runTx(operation, params)` is the one-shot helper that builds, signs, and submits in a single call (alias of `buildAndSignAndSubmitTx`). For step-by-step control — and to drive the transaction modal UI — use `buildTx()` then `signAndSubmitTx()`; see [`@chettapay/core`](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-core). For a native XLM payment use `asset: { type: 'native' }`.

Transaction fees are paid from your app's sponsorship wallet configured in the Dashboard. Users pay zero XLM.

---

## 5. Transaction history

```tsx
'use client';

import { useChettaPay } from '@chettapay/react';

import { useEffect } from 'react';

export function History() {
  const { txHistory, getClient } = useChettaPay();

  // `txHistory` is a state machine; trigger a fetch on the underlying client.
  useEffect(() => {
    getClient().fetchTxHistory({ limit: 20 });
  }, [getClient]);

  if (txHistory.step !== 'loaded') return <p>Loading...</p>;

  return (
    <ul>
      {txHistory.data.records.map((tx) => (
        <li key={tx.id}>
          {tx.summary} · {tx.status}
        </li>
      ))}
    </ul>
  );
}
```

> The simplest path is the built-in modal: call `openTxHistoryModal()` from `useChettaPay()` and ChettaPay renders the list for you — no state wiring needed.

---

## Complete example

```tsx
'use client';

import { ChettaPayProvider, useChettaPay } from '@chettapay/react';

function WalletDemo() {
  const { isAuthenticated, wallet, login, runTx, openTxHistoryModal } = useChettaPay();

  if (!isAuthenticated) {
    return (
      <button onClick={() => login({ provider: 'google' })}>
        Continue with Google
      </button>
    );
  }

  return (
    <div>
      <p>✓ Wallet active — {wallet?.address}</p>
      <button
        onClick={() =>
          runTx('payment', {
            destination: 'GXXX...',
            amount: '5.00',
            asset: { type: 'credit_alphanum4', code: 'USDC', issuer: 'GA5Z...' },
          })
        }
      >
        Send 5 USDC
      </button>
      <button onClick={openTxHistoryModal}>History</button>
    </div>
  );
}

export default function App() {
  return (
    <ChettaPayProvider client={{ apiKey: process.env.NEXT_PUBLIC_CHETTAPAY_PUBLISHABLE_KEY! }}>
      <WalletDemo />
    </ChettaPayProvider>
  );
}
```

---

> Both `@chettapay/core` and `@chettapay/react` ship with full TypeScript types — no `@types/` package needed.
