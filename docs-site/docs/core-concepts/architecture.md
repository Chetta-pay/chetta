---
title: "Architecture"
---

ChettaPay sits between your app and the Stellar network. This page explains how the three components interact and how requests flow from your frontend to the blockchain.

---

## The three components

```mermaid
flowchart TD
    A("Your App\nRemittances · Neobank · Wallet"):::external

    subgraph chettapay["ChettaPay"]
        B("1. SDK\n@chettapay/core · @chettapay/react"):::sdk
        C("2. ChettaPay Server\nchettapay-api.vercel.app · chettapay-server-api.vercel.app"):::server
        D("3. Dashboard\nchettapay-dashboard.vercel.app"):::dashboard
    end

    E("Stellar Network\nTestnet · Mainnet"):::external
    F("AWS KMS\nKey management"):::infra
    G("PostgreSQL\nTransaction history"):::infra

    A -->|"calls"| B
    B -->|"HTTP"| C
    C -->|"submits transactions"| E
    C -->|"encrypts / decrypts keys"| F
    C -->|"persists tx history"| G
    D -.->|"configures"| C

    classDef external fill:#f1efe8,stroke:#b4b2a9,color:#444441
    classDef sdk fill:#e1f5ee,stroke:#1d9e75,color:#085041
    classDef server fill:#eeedfe,stroke:#7f77dd,color:#3c3489
    classDef dashboard fill:#faeeda,stroke:#ba7517,color:#633806
    classDef infra fill:#e6f1fb,stroke:#378add,color:#0c447c
```

| Component                                 | Runs where                                 | Your responsibility                                                |
| ----------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| **SDK** (`@chettapay/core`, `@chettapay/react`) | Your frontend                              | Install and configure with your publishable key                    |
| **ChettaPay Server**                         | Hosted by ChettaPay at `chettapay-api.vercel.app` (SDK) and `chettapay-server-api.vercel.app` (backend) | Nothing — you call it via the SDK or REST API                      |
| **Dashboard**                             | Hosted by ChettaPay at `chettapay-dashboard.vercel.app` | Configure your app settings, funding mode, and sponsorship wallets |

---
## Networks

| Network     | Notes                                               |
| ----------- | --------------------------------------------------- |
| **Testnet** | Development and testing. Free, resets periodically. |
| **Mainnet** | Production. Real XLM required.                      |

Futurenet is not supported by default. If your project requires it, [contact us](mailto:hello@chettapay.com).

Each network has its own set of API keys — see [API Keys](https://chettapay-docs.vercel.app/docs/getting-started/api-keys) for prefixes and usage rules.

> Full details on Stellar networks at [developers.stellar.org/docs/networks](https://developers.stellar.org/docs/networks).
---

## App wallets

When you create an app in the Dashboard, ChettaPay provisions a set of Stellar accounts
that cover costs on behalf of your users — not user funds, but the infrastructure
costs of running wallets on Stellar. There are three distinct roles:

| Wallet                  | Covers                                       | Charged when               |
| ----------------------- | -------------------------------------------- | -------------------------- |
| **Funding wallet**      | XLM reserve for new user wallets             | Once per wallet activation |
| **Gas wallet**          | Transaction fees for all on-chain operations | Every transaction          |
| **Distribution wallet** | Assets sent via distribution rules           | Every claim                |

By default a single wallet is created when you create your app and covers all three
roles. This is fine for development and early-stage apps.

As your app scales, separating them into three distinct wallets gives you independent
balance tracking, separate funding schedules, and tighter control over each cost
center. For example, your gas wallet gets topped up frequently in small amounts while
your funding wallet is replenished in larger batches tied to user growth. Mixing them
in a single wallet makes it harder to monitor and plan each cost independently.

For configuration and recommended minimum balances see
[Operator guide/Configuration/App Wallets](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/account-funding).

---

## Request lifecycle

What happens from the moment a user calls `login()` to the moment their wallet is ready:

```mermaid
sequenceDiagram
    participant App as Your App
    participant SDK as ChettaPay SDK
    participant Server as ChettaPay Server
    participant KMS as AWS KMS
    participant Stellar as Stellar Network

    App->>SDK: login({ provider: 'google' })
    SDK->>Server: POST /wallets/create
    Server->>KMS: generateDataKey()
    KMS-->>Server: encryptedKey
    Server->>Stellar: createAccount + changeTrust
    Note over Server,Stellar: Fees and XLM reserve paid by your sponsorship wallet(s)
    Stellar-->>Server: G-address confirmed
    Server-->>SDK: { address, status }
    SDK-->>App: wallet available in useChettaPay()
```

For the deferred funding flow see [Funding Modes](https://chettapay-docs.vercel.app/docs/core-concepts/funding-modes).

---

## Security boundary

All private keys — user wallets and your app's sponsorship wallets — are managed through AWS KMS and never stored in plaintext anywhere in ChettaPay's infrastructure.

When the ChettaPay Server needs to sign a transaction, it requests a decryption from KMS. Every request leaves an immutable CloudTrail audit record.

By design, the ChettaPay Server can only:

- Sign fee-bump transactions (to cover transaction fees on behalf of users)

- Execute account sponsorship sequences (to fund new wallets)

The ChettaPay Server cannot move user funds — the sponsorship wallet only covers fees and XLM reserves and has no authority to transfer a user's assets.

For the full security model see [Security Model](https://chettapay-docs.vercel.app/docs/core-concepts/security-model).

---

## Data persistence

| Data                         | Where it lives    | Retention         |
| ---------------------------- | ----------------- | ----------------- |
| Transaction history (recent) | Stellar RPC       | 7 days            |
| Transaction history (full)   | ChettaPay PostgreSQL | Indefinite        |
| Encrypted private keys       | AWS KMS           | Per key lifecycle |
| App configuration            | ChettaPay PostgreSQL | Per app lifecycle |

The ChettaPay Server intercepts every fee-bump transaction it signs and persists it to PostgreSQL. Because ChettaPay processes all fee-bumps for your app, it has full visibility into your transaction history without indexing the entire blockchain.

For details on querying history see [Transaction History](https://chettapay-docs.vercel.app/docs/core-concepts/transaction-history).
