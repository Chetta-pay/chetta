---
title: "Earn"
---

**Dashboard → Treasury → Earn**

Choose which yield providers your users can access to earn on their balances. **If no provider is enabled, the Earn UI is hidden for your users.**

---

## Providers

| Provider     | Type            | Notes                                            |
| ------------ | --------------- | ------------------------------------------------ |
| **DeFindex** | Yield vaults    | Requires a DeFindex API key (stored per app)     |
| **Blend**    | Lending pools   | Toggle on to expose Blend pools                  |

Enable a provider and, where required, add its credentials (e.g. the DeFindex API key). You can add or remove the key from this page.

---

## In the SDK

The providers configured here drive the client SDK:

- `getEarnProviders()` → enabled providers (empty = Earn disabled)
- `getEarnOpportunities(provider)` → vaults/pools with live APY
- `getEarnPosition(params)` → the wallet's position
- `earnDeposit(params)` / `earnWithdraw(params)` → move funds
- `openEarnModal()` (`@chettapay/react`) → the pre-built Earn modal

See [`@chettapay/core`](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-core) and [`@chettapay/react`](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-react).
