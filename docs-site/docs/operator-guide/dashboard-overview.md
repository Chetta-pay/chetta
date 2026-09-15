---
title: "Dashboard Overview"
---

The ChettaPay Dashboard at [chettapay-dashboard.vercel.app](https://chettapay-dashboard.vercel.app) is the control panel for your app's configuration. Sign in with Google — no Stellar wallet required.

Each app you create is isolated with its own API keys, wallets, and configuration. You can switch between apps from the top navigation bar.

---

## Navigation

The per-app sidebar is organized into seven groups. A few sections are still gated behind a "coming soon" state — marked `upcoming` below.

### Overview

| Section          | What you do here                                       |
| ---------------- | ------------------------------------------------------ |
| **Home**         | Per-app landing with key status at a glance            |
| **Get started**  | Onboarding checklist (hidden once you're set up)       |

### Build

| Section           | What you do here                                                                |
| ----------------- | ------------------------------------------------------------------------------- |
| **Settings**      | App name, network, and auth token lifetimes                                     |
| **API Keys**      | Generate and manage publishable and secret keys                                 |
| **Domains**       | Configure allowed origins (CORS) so the SDK can make requests from your app     |
| **Webhooks** `upcoming` | Configure inbound webhook URLs and view event logs                        |
| **Branding**      | Customize the ChettaPay modals — theme, accent color, logo                         |
| **Members**       | View team members; the owner manages access                                     |

### Users

| Section       | What you do here                                                              |
| ------------- | ----------------------------------------------------------------------------- |
| **Accounts**  | Browse users, view login history, and manage accounts                         |
| **Wallets**   | Browse user wallets — view status, balances, and fund them manually           |

### Treasury

| Section                 | What you do here                                                          |
| ----------------------- | ------------------------------------------------------------------------- |
| **Tokens & Trustlines** | Configure which assets are automatically enabled on new user wallets. Funding Mode (Immediate / Deferred) is set here and on Account Funding. |
| **Account Funding**     | View and fund your funding (reserve) wallet; choose the funding mode      |
| **Sponsorship**         | Rules for which transaction types are sponsored and per-user limits       |
| **Transaction Policy**  | Restrict which destinations user transactions may target                  |
| **Auth Policy**         | Policies governing authentication (allowed methods / rules)               |
| **Swap**                | Configure the swap venues exposed to end-users                            |
| **Earn**                | Configure the yield providers (DeFindex / Blend) exposed to end-users     |
| **Token Distribution**  | Configure claimable distribution rules — assets, amounts, rate limits     |

### Integrations

| Section            | What you do here                                                     |
| ------------------ | ------------------------------------------------------------------- |
| **Authentication** `upcoming` | Configure supported OAuth providers and email OTP        |
| **KYC** `upcoming` | Configure identity-verification providers                           |
| **Ramps**          | Configure fiat on/off-ramp providers (Bridge, Etherfuse, …)         |
| **ChettaPay Checkout**     | ChettaPay Checkout integration                                              |

> A server-side **Wallets** integration (custodian / wallet-adapter) existed here previously and is currently hidden from the dashboard. For client-side wallet login (Stellar Wallets Kit, Privy), see [Wallet Adapters](https://chettapay-docs.vercel.app/docs/sdk-reference/wallet-adapters).

### Monitor

| Section          | What you do here                                       |
| ---------------- | ------------------------------------------------------ |
| **Transactions** | View on-chain transactions across your app             |
| **Logs**         | API request logs, errors, and delivery history         |
| **Alerts** `upcoming` | Set up low-balance alerts via email or webhook    |

### Danger Zone

| Section          | What you do here                                                        |
| ---------------- | ---------------------------------------------------------------------- |
| **Archive app** (owner only) | Archive the app — disables its API keys and SDK access entirely (reversible by unarchiving) |

---

## Get started checklist

When you create a new app, the Dashboard shows a checklist of required steps before you can go live:

1. **Configure API keys** — generate a publishable key to connect your SDK
2. **Configure domains** — add allowed origins so the SDK can make requests
3. **App wallet created and funded** — your funding wallet must be active on Stellar with enough XLM to cover wallet creation
4. **Enable trustlines** — configure at least one asset so user wallets can hold it
5. **Install the SDK and create your first wallet** — confirms the integration is working end-to-end

---

## Testnet vs Mainnet

Each app targets a single network. Apps start on **Testnet**; moving to **Mainnet** is a gated request/approval flow (via the network control in the top bar), not a free toggle. API keys, wallets, and configuration are scoped to the app's network.

Start on Testnet — it's free and resets periodically. Request Mainnet when you're ready for production. See [Mainnet Checklist](https://chettapay-docs.vercel.app/docs/guides/mainnet-checklist) before switching.
