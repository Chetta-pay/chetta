---
title: "API Keys"
---

---

ChettaPay issues two types of keys per environment. Understanding the difference is important before writing any code.

---

## Key types

| Type        | Prefix         | Network | Use                                     |
| ----------- | -------------- | ------- | --------------------------------------- |
| Publishable | `pub_testnet_` | Testnet | Frontend only (safe to expose)          |
| Publishable | `pub_mainnet_` | Mainnet | Frontend only (safe to expose)          |
| Secret      | `sec_testnet_` | Testnet | Backend only (never expose client-side) |
| Secret      | `sec_mainnet_` | Mainnet | Backend only (never expose client-side) |

The **publishable key** is passed to `@chettapay/core` or `@chettapay/react` in your frontend. The **secret key** stays on your backend and is used for privileged operations like funding deferred wallets via `POST /v1/wallets/fund`.

> For details on Stellar networks (Testnet vs Mainnet) see the [Stellar Networks docs](https://developers.stellar.org/docs/networks).

---

## Generating a key

1. Go to [chettapay-dashboard.vercel.app](https://chettapay-dashboard.vercel.app) and sign in with Google, GitHub, or email OTP
2. Navigate to **Build → API Keys → Generate**
3. Select the key type and network
4. Copy and store it securely — secret keys are only shown once

Start with `pub_testnet_` for development. Switch to `pub_mainnet_` when ready for production.

> **Testnet rate limit:** Testnet keys are limited to 1,000 requests per day. This is enough for active development — if you hit the limit, wait until the next UTC day or [contact us](mailto:hello@chettapay.com) for a temporary increase.

---

## Environment variables

Store keys in environment variables — never hardcode them or commit them to version control.

### Next.js

```bash
# .env.local
NEXT_PUBLIC_CHETTAPAY_PUBLISHABLE_KEY=pub_testnet_xxxxxxxxxxxxxxxxxxxx
CHETTAPAY_SECRET_KEY=sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

`NEXT_PUBLIC_` prefix makes the publishable key available client-side. Never apply this prefix to the secret key.

### Vite / CRA

```bash
# .env.local
VITE_CHETTAPAY_PUBLISHABLE_KEY=pub_testnet_xxxxxxxxxxxxxxxxxxxx
CHETTAPAY_SECRET_KEY=sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

`VITE_` prefix exposes the variable to the browser bundle. Never apply it to the secret key.

---

## Security rules

- The publishable key is safe to expose in frontend code — it can only initiate user-authenticated operations

- The secret key must never appear in client-side code, browser bundles, or public repositories

- For mainnet, use build-time environment injection or a backend proxy — never hardcode `pub_mainnet_` in source

- Rotate a compromised key immediately from **Dashboard → Build → API Keys**