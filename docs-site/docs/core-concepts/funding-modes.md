---
title: "Funding Modes"
---

Every Stellar account requires a minimum XLM reserve to exist on-chain. ChettaPay gives you two modes to control exactly when that reserve is funded — so you only pay for users who matter to your app.

Configure the funding mode from **Dashboard → Treasury → Funding Mode**. No code changes required.

---

## The two modes

```mermaid
flowchart TD
    A("User registers"):::neutral
    A --> B{"Funding mode"}:::decision
    B -->|"Immediate"| C("Wallet funded on registration\nreserve sponsored at login"):::immediate
    B -->|"Deferred"| D("G-address created, no reserve\nActivated via webhook from your backend"):::deferred
    C --> E("Wallet ready"):::ready
    D --> F("Wallet pending"):::pending
    F -->|"POST /v1/wallets/fund\nor Dashboard Fund button"| E

    classDef neutral fill:#f1efe8,stroke:#b4b2a9,color:#444441
    classDef decision fill:#faeeda,stroke:#ba7517,color:#633806
    classDef immediate fill:#eaf3de,stroke:#639922,color:#3b6d11
    classDef deferred fill:#eeedfe,stroke:#7f77dd,color:#3c3489
    classDef ready fill:#eaf3de,stroke:#639922,color:#3b6d11
    classDef pending fill:#e6f1fb,stroke:#378add,color:#0c447c
```

| Mode          | XLM cost                    | Activation trigger        | Best for                                      |
| ------------- | --------------------------- | ------------------------- | --------------------------------------------- |
| **Immediate** | \~1–2 XLM locked per registration | Automatic on login        | Apps without compliance requirements          |
| **Deferred**  | \~1–2 XLM locked per funded wallet only | Webhook from your backend | Neobanks, remittance apps, KYC-gated products |

In both modes, any individual wallet can also be funded manually from **Dashboard → Users → Wallets (Fund)**. This is useful as a fallback or for support workflows.

> **How the reserve is covered:** Every Stellar account requires a base reserve of **1 XLM**, and each trustline (asset) you configure in the Dashboard adds **0.5 XLM**. ChettaPay sponsors these reserves (CAP-33): the XLM stays **locked in your funding wallet** while it sponsors the user wallet — it is not transferred to the user:
>
> `1 XLM + (number of configured assets × 0.5 XLM)` locked per funded wallet
>
> | Assets configured    | Reserve required |
> | -------------------- | ---------------- |
> | 0                    | 1 XLM            |
> | 1 (e.g. USDC)        | 1.5 XLM          |
> | 2 (e.g. USDC + EURC) | 2 XLM            |
> | 3                    | 2.5 XLM          |
>
> ChettaPay does not charge extra. On top of the locked reserve, the **starting balance** configured in **Dashboard → Treasury → Account Funding** (if any) is transferred to each new wallet as spendable XLM.
>
> References: [Minimum Balance](https://developers.stellar.org/docs/learn/fundamentals/lumens#minimum-balance) · [Trustlines](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#trustlines)

---

## Immediate

The wallet is funded atomically at the moment the user logs in. Ready in under 3 seconds. No additional setup required.

**Cost:** the sponsored reserve is locked for every registration — including users who abandon onboarding — plus the configured starting balance, if any.

```tsx
const { login, isAuthenticated } = useChettaPay();
await login({ provider: 'google' });
// once isAuthenticated is true, the wallet is funded and ready immediately
```

---

## Deferred

The G-address is created on-chain at registration but without an XLM reserve. The wallet exists but cannot transact until it is activated.

**Cost:** the reserve is only locked for users you fund. Zero cost for users who abandon.

This mode solves a problem unique to Stellar: every account needs a minimum XLM reserve to exist on-chain. Without deferred funding, an app with 10,000 users who abandon onboarding locks 10,000+ XLM for nothing.

### Funding via webhook

Your backend calls `POST /v1/wallets/fund` when a business event occurs — KYC approved, first deposit, email verified, or any trigger you define.

```bash
POST https://chettapay-server-api.vercel.app/v1/wallets/fund
x-chettapay-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "publicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

> Never call this endpoint from the client. It requires your secret key and must run on your backend. See the [Server API](https://chettapay-docs.vercel.app/docs/sdk-reference/server-api) reference.

**Response codes:**

| Code                      | Meaning                                              |
| ------------------------- | ---------------------------------------------------- |
| `200 OK`                  | Wallet funded. Reserve sponsored on-chain.           |
| `400 Bad Request`         | Missing or malformed `publicKey`.                    |
| `402 Payment Required`    | Funding wallet has insufficient XLM.                 |
| `404 Not Found`           | `publicKey` is not a wallet owned by your app.       |
| `409 Conflict`            | Wallet is already funded. Safe to ignore.            |
| `503 Service Unavailable` | Stellar network issue.                               |

### Funding manually from the Dashboard

Any not-yet-funded wallet can be funded from **Dashboard → Users → Wallets** with the **Fund** action — the same sponsored funding as login. This works in both Immediate and Deferred mode and is useful for support workflows or one-off overrides.

### Checking whether a wallet is funded

The funded state is reflected on-chain. From an authenticated session you can read the wallet's balances — an unfunded wallet has no XLM reserve yet:

```tsx
const { walletBalance, refreshWalletBalance } = useChettaPay();

await refreshWalletBalance();
if (walletBalance.step === 'loaded') {
  // inspect walletBalance.data.balances to see if the reserve / assets are present
}
```

---

## Switching modes

You can switch funding modes at any time from the Dashboard without changing any code. The new mode applies to all wallets created after the switch. Existing wallets are not affected.

---

## Cost comparison

For an app with 10,000 registered users where 30% complete activation:

| Mode        | XLM spent        | Cost basis           |
| ----------- | ---------------- | -------------------- |
| Immediate   | \~20,000 XLM     | Every registration   |
| Deferred    | \~6,000 XLM      | Only activated users |
| **Savings** | **\~14,000 XLM** | <br />               |

The Dashboard shows a real-time cost breakdown per mode so you can optimize as your app grows.
