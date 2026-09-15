---
title: "Transaction Policy"
---

**Dashboard → Treasury → Transaction Policy**

Control which sensitive Stellar operations custodial wallets are allowed to sign. Rules are enforced server-side — a custodial wallet refuses to sign anything the policy blocks.

---

## Account merge

`account_merge` transfers a wallet's entire balance to another account and **permanently deletes it on-chain**. It is **blocked by default**.

- **Allowed destinations** — an allowlist of `G…` addresses that `account_merge` may send to. Empty = account merge is fully blocked.
- **Allow any destination** — permits `account_merge` to send to any address. Dangerous: a client could sign a merge that drains and deletes the custodial wallet, sending all funds to an arbitrary address. Prefer an explicit allowlist; only enable this if you fully control how transactions are built.

---

## Maximum transaction fee

The highest total fee a custodial wallet may sign for a single transaction.

- **Max fee (XLM)** — allowed range **0.01 – 100 XLM**. Leave empty to use the **10 XLM** default.

Expensive Soroban contract calls (e.g. DeFindex / Blend deposits) can exceed the default — raise the cap to allow them, or lower it for stricter spend control.
