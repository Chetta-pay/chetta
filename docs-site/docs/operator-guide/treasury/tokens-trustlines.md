---
title: "Tokens & Trustlines"
---

**Dashboard → Treasury → Tokens & Trustlines**

Configure which assets are automatically enabled on new user wallets at creation or activation.

---

## How it works

When a user wallet is created or activated, ChettaPay automatically sets up a trustline for each asset configured here. Users never need to manually enable assets.

Each trustline adds **0.5 XLM** to the wallet's reserve cost — charged from your funding wallet. See [App Wallets](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/account-funding) for the full cost breakdown.

---

## Adding an asset

1. Click **Add asset**
2. Enter the asset code (e.g. `USDC`) and issuer G-address
3. Click **Save**

The asset is enabled on all new wallets from this point. Existing wallets are not affected.

---

## Common assets on Stellar

| Asset | Issuer                                                     |
| ----- | ---------------------------------------------------------- |
| USDC  | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| EURC  | `GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP`  |
| AQUA  | `GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA` |

Always verify issuer addresses from the official asset issuer before adding.

---

## Removing an asset

Removing an asset from the list stops it from being added to new wallets. Existing trustlines on active wallets are not removed — trustlines can only be removed by the wallet owner.
