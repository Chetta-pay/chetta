---
title: "Overview"
---

**ChettaPay** is the onboarding-to-payment infrastructure layer for consumer apps on Stellar. The full stack that takes a new user from clicking **Continue with Google** to sending USDC — without ever showing them a seed phrase, a wallet address, a transaction fee, or a trustline prompt.

---

## The problem

Every team building a consumer product on Stellar hits the same infrastructure wall before writing a single line of their actual product:

- Creating or linking a Stellar account for each user

- Handling XLM reserve funding

- Configuring trustlines for each asset

- Abstracting transaction fees from users unfamiliar with blockchain

- Building an onboarding flow that works for people with zero crypto experience

ChettaPay handles all of this so you can skip straight to building your product.

---

## The solution

```tsx
import { ChettaPayProvider, useChettaPay } from '@chettapay/react';

function App() {
  const { isAuthenticated, login, runTx } = useChettaPay();

  if (!isAuthenticated) {
    return (
      <button onClick={() => login({ provider: 'google' })}>
        Continue with Google
      </button>
    );
  }

  return (
    <button
      onClick={() =>
        runTx('payment', {
          destination: 'GXXX...',
          amount: '10',
          asset: { type: 'credit_alphanum4', code: 'USDC', issuer: 'GA5Z...' },
        })
      }
    >
      Send 10 USDC
    </button>
  );
}

export default function Root() {
  return (
    <ChettaPayProvider client={{ apiKey: 'pub_testnet_...' }}>
      <App />
    </ChettaPayProvider>
  );
}
```

In a handful of lines: OAuth authentication, a funded Stellar wallet, and USDC payments. No seed phrases. No fee prompts. No trustline configuration. (`runTx` is the one-shot build → sign → submit helper; see the [SDK Reference](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-react) for the split `buildTx` / `signAndSubmitTx` flow.)

---

## How it compares

| <br />                | Crossmint       | Privy | Dynamic | Stellar Wallets Kit  | **ChettaPay**       |
| --------------------- | --------------- | ----- | ------- | -------------------- | ---------------- |
| Stellar native        | Partial         | No    | No      | Yes (connector only) | **Yes**          |
| Deferred funding      | No              | N/A   | N/A     | No                   | **Yes (unique)** |
| Fee-bump native       | No              | N/A   | N/A     | No                   | **Yes**          |
| Built for startups    | No (enterprise) | Yes   | Yes     | Partial              | **Yes**          |
| Full onboarding stack | No              | No    | No      | No                   | **Yes**          |

> ChettaPay also **integrates** with several of these: first-party adapters let you use Privy embedded wallets or any Stellar Wallets Kit wallet as a login method on top of ChettaPay's stack. See [Wallet Adapters](https://chettapay-docs.vercel.app/docs/sdk-reference/wallet-adapters).
