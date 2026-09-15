---
title: "API Keys"
---

**Dashboard → Build → API Keys**

---

## Key types

| Type | Prefix | Network | Use |
|---|---|---|---|
| Publishable | `pub_testnet_` | Testnet | Frontend only (safe to expose) |
| Publishable | `pub_mainnet_` | Mainnet | Frontend only (safe to expose) |
| Secret | `sec_testnet_` | Testnet | Backend only (never expose client-side) |
| Secret | `sec_mainnet_` | Mainnet | Backend only (never expose client-side) |

**Publishable keys** are passed to `@chettapay/core` or `@chettapay/react` in your frontend. They can only initiate user-authenticated operations.

**Secret keys** are used in your backend for privileged endpoints like `POST /v1/wallets/fund`. Never expose them client-side.

> The key's network (testnet/mainnet) follows the **app's** network — it is not chosen per key. The prefix simply reflects the app environment the key belongs to.

---

## Generating a key

1. Click **Generate key**
2. Select the type (Publishable or Secret)
3. Copy the key immediately — secret keys are only shown once

---

## Rotating a key

There is no dedicated "rotate" action — rotate by generating a replacement and deleting the old one:

1. **Generate** a new key of the same type
2. Update your environment variables to the new key
3. **Delete** the old key — requests using it then fail with `API_KEY_NOT_FOUND`

Rotate your secret key immediately if you suspect it has been exposed.

---

## Key permissions

| Operation | Publishable | Secret |
|---|---|---|
| Login / logout | ✓ | ✓ |
| Send payment | ✓ | ✓ |
| Get wallet | ✓ | ✓ |
| Get history | ✓ | ✓ |
| Activate wallet | — | ✓ |
| Get app config | — | ✓ |
| List all wallets | — | ✓ |

---

## Multiple keys

You can generate multiple keys of the same type — useful for separate deployment environments (staging, production) or rotating keys without downtime.

All active keys are listed with their creation date and last used timestamp.

---

## Security checklist

- Never commit keys to version control — use environment variables
- Never prefix secret keys with `NEXT_PUBLIC_` or `VITE_`
- Use separate keys for testnet and mainnet
- Rotate keys periodically and immediately after any suspected exposure