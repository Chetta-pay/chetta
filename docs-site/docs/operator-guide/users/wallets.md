---
title: "Wallets"
---

**Dashboard → Users → Wallets**

Browse and manage all user wallets created through your app.

---

## Wallet list

The wallet list shows every wallet associated with your app:

| Column | Description |
|---|---|
| **G-address** | Stellar public key — the wallet's identifier; links to Stellar Expert |
| **User** | Associated user email or ID |
| **Status** | **Active** (funded on-chain) or **Not funded** |
| **Balances** | Current asset balances |
| **Created** | Creation timestamp |

Filter by status, search by user email or address.

---

## Funding a wallet manually

In Deferred mode, wallets start unfunded (**Not funded**). You can fund one from the Dashboard at any time:

1. Find the wallet in the list
2. Click **Fund 2 XLM** next to a **Not funded** wallet
3. The XLM reserve is funded from your funding wallet

The wallet moves to **Active** within ~2 seconds. (This is also the manual fallback for Immediate-mode wallets whose initial funding didn't complete.)

---

## Wallet detail

Click any wallet to see:

- Full transaction history
- Current balances per asset
- Activation timestamp
- Associated user
- Link to Stellar Expert for on-chain verification