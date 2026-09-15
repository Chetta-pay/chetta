---
title: "Account Funding"
---

**Dashboard → Treasury → Account Funding**

Manage your app's **funding wallet** — the Stellar account that sponsors the XLM reserve of new user wallets and seeds them with the configured starting balance. This page is where you view its balance, copy its address, and top it up.

ChettaPay uses a set of operator wallets to cover costs on behalf of your users; each role has its own Treasury page:

| Wallet                  | Treasury page                                                                                          | Role                                                         | Charged when               |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------- |
| **Funding wallet**      | Account Funding (this page)                                                                            | Sponsors the XLM reserve of new user wallets (locked, not spent) and sends their starting balance | Once per funded wallet |
| **Gas wallet**          | [Sponsorship](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/sponsorship)                       | Pays transaction fees for all on-chain operations            | Every transaction          |
| **Distribution wallet** | [Token Distribution](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/token-distribution)         | Sends assets to users via claimable distribution rules       | Every claim                |

By default a single wallet is created when you create your app and covers all three roles. You can configure separate wallets for each role as your app scales.

---

## Funding a wallet

### Option 1 — Send directly to the G-address

Copy the wallet's Stellar G-address and send XLM or assets from any Stellar wallet or exchange.

### Option 2 — Fund from the Dashboard

Click **Fund wallet** in the Dashboard, connect your Stellar wallet, and send funds with a single click.

---

## Recommended minimum balances

| Wallet              | Recommended minimum                                       |
| ------------------- | --------------------------------------------------------- |
| Funding wallet      | 50 XLM (\~25 funded wallets with 2 assets each)           |
| Gas wallet          | 10 XLM                                                    |
| Distribution wallet | Depends on configured assets and expected distribution volume |

Configure low-balance alerts in [Alerts](https://chettapay-docs.vercel.app/docs/operator-guide/monitor/alerts) so you are notified before running out of funds.

---

## XLM reserve cost per funded wallet

The XLM locked per funded user wallet depends on how many assets are configured in [Tokens / Trustlines](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/tokens-trustlines):

`1 XLM + (number of configured assets × 0.5 XLM)` locked per funded wallet

| Assets configured    | Reserve required |
| -------------------- | ---------------- |
| 0                    | 1 XLM            |
| 1 (e.g. USDC)        | 1.5 XLM          |
| 2 (e.g. USDC + EURC) | 2 XLM            |
| 3                    | 2.5 XLM          |

ChettaPay does not charge extra — the reserve stays locked in your funding wallet while it sponsors the user wallet (CAP-33), and the configured starting balance (if any) is transferred on top as spendable XLM.

> References: [Minimum Balance](https://developers.stellar.org/docs/learn/fundamentals/lumens#minimum-balance) · [Trustlines](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#trustlines)
