---
title: "Chains"
---

**Dashboard → Build → Chains**

Choose which blockchains your app provisions wallets on. Your users get **one wallet per enabled chain**, created at login.

Chains are independent of your network: on a testnet app, Polygon means **Amoy**, and on a mainnet app it means Polygon mainnet. You do not pick that here — it follows the app's network, set at creation under [Settings](https://chettapay-docs.vercel.app/docs/operator-guide/build/settings).

---

## The chains

| Chain | Fees | What your treasury has to hold |
|---|---|---|
| **Stellar** | Sponsored | XLM in the funding wallet. It pays the account-creation reserve and sponsors your users' fees, so a user wallet can sit at zero XLM and still transact. |
| **Polygon** (EVM) | **Not** sponsored | POL in the Polygon GAS wallet. Every user wallet must hold POL of its own to sign, so ChettaPay transfers POL into each one. |
| **Solana** | **Not** sponsored | SOL in the Solana GAS wallet. Same as Polygon, plus the rent-exempt minimum below. |

Stellar is the exception, not the rule. On Polygon and Solana there is no sponsorship at all: a wallet that holds none of the native token signs nothing. That is why both surface their GAS wallet and its balance on this page, right next to the switch that creates the obligation.

> **Solana's extra catch:** an account that falls below the rent-exempt minimum is deleted by the network and its balance is lost. The top-up keeps every user wallet above that line, which is one more reason the GAS wallet must not run dry.

---

## Enabling a chain

Each toggle opens a confirmation, because none of these are cheap clicks: enabling a chain commits your treasury to funding it.

For Polygon and Solana the page also lets you **create the app's GAS wallet** if it does not exist yet, and shows its balance once it does. Stellar's equivalent lives in [Treasury → Account Funding](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/account-funding); Polygon and Solana have no Treasury page of their own, so they are created and monitored here.

A GAS wallet at **zero balance** is the failure mode worth watching. The wallet exists, every user gets an address, and not one of them can sign. The page flags it in red.

A chain the platform is not serving right now appears **locked** rather than hidden, so you can tell the difference between "not available" and "not enabled". Contact ChettaPay to have it turned on.

---

## Order matters

Enabled chains are **ordered**, and the order is not cosmetic. The array is handed to the SDK exactly as you arrange it through `/v1/applications/config`, so **the first chain is the default your users see** in the SDK's chain pickers.

Drag a row by its grip, or use the arrows, to reorder. Reordering saves immediately with no confirmation: it orphans nothing and creates no funding obligation.

Two details follow from that:

- A newly enabled chain joins the **end** of the list. Enabling never silently changes which chain is your default.
- A disabled chain has no position, because it is not sent to the SDK at all.

Your client should drive its chain selector from `/v1/applications/config` rather than from the user's wallet list. A chain can be enabled before a given user has been provisioned on it.

---

## Disabling a chain

Turning a chain off **never deletes wallets or keys**. It stops new ones being created and hides the existing ones from your users.

The confirmation tells you how many user wallets already exist on that chain, because those get orphaned: your users stop seeing them, along with **any funds left in them**, until you enable the chain again.

This is reversible. Re-enabling restores access to the existing wallets.

---

## Related

- [Account Funding](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/account-funding) — the Stellar funding wallet and its XLM reserve
- [Sponsorship](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/sponsorship) — who pays the fee on Stellar
- [Tokens / Trustlines](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/tokens-trustlines) — the assets enabled on each wallet
- [Wallets](https://chettapay-docs.vercel.app/docs/operator-guide/users/wallets) — the user wallets these chains provision
