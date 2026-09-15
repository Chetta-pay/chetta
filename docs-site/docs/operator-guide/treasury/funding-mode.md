---
title: "Funding Mode"
---

**Dashboard → Treasury → Account Funding** (the funding-mode selector lives on the Account Funding page — there is no standalone "Funding Mode" page).

Controls when new user wallets are funded with their XLM reserve. Switch modes at any time without code changes — the new mode applies to all wallets created after the switch.

---

## Modes

| Mode          | Cost                        | Activation trigger                                    | Best for                                      |
| ------------- | --------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| **Immediate** | \~2 XLM per registration    | Automatic on login                                    | Apps without compliance requirements          |
| **Deferred**  | \~2 XLM per activation only | Webhook from your backend | Neobanks, remittance apps, KYC-gated products |

In both modes, any individual wallet can also be funded manually from **Dashboard → Users → Wallets** using the **Fund 2 XLM** action. This is useful as a fallback or for support workflows.

---

## Immediate

The wallet is funded atomically at the moment the user logs in. Ready in under 3 seconds. No additional setup required.

---

## Deferred

The G-address is created on-chain at registration but without an XLM reserve. Funding happens when your backend calls `POST /v1/wallets/fund` after a business event occurs (KYC approved, first deposit, etc.). See [Deferred Flow Guide](https://chettapay-docs.vercel.app/docs/guides/deferred-flow-guide) for the full setup.