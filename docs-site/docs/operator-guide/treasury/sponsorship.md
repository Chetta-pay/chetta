---
title: "Sponsorship"
---

**Dashboard → Treasury → Sponsorship**

Controls which transactions your app sponsors and the limits applied per user. All rules are enforced server-side by the ChettaPay Server — they cannot be bypassed from the client SDK.

---

## Sponsored transaction types

Select which Stellar operation types are covered by your gas wallet:

| Type | Description |
|---|---|
| `payment` | Asset transfers between wallets |
| `trustline` | Adding a new asset trustline to a wallet |
| `activation` | Account sponsorship sequence for new wallets |
| Custom | Define rules based on asset, amount range, or other criteria |

Transactions of unselected types are rejected before reaching the Stellar network.

---

## Per-user limits

Prevent abuse by setting caps per user:

| Setting | Description |
|---|---|
| `daily_ops_cap` | Maximum sponsored operations per user per day |
| `max_fee_per_tx` | Maximum fee the gas wallet will pay per transaction (in stroops) |
| `approved_assets` | Whitelist of assets eligible for fee sponsorship |

---

## Custom rules `coming soon`

Define granular sponsorship rules — for example, only sponsor USDC payments under $100, or only sponsor trustlines for configured assets.