---
title: "ChettaPay Documentation"
---

**ChettaPay** is the onboarding-to-payment infrastructure layer for consumer apps on Stellar. The full stack from social login to USDC payments — without exposing users to blockchain complexity.

- [chettapay-dashboard.vercel.app](https://chettapay-dashboard.vercel.app) — Create an app and get your API keys

- [github.com/Chetta-pay/chetta](https://github.com/Chetta-pay/chetta) — Open source SDK

- [Telegram](https://t.me/+R76f1BarXSUxMTQx) — ChettaPay community

## Getting Started

| <br />                                            | <br />                                          |
| ------------------------------------------------- | ----------------------------------------------- |
| [Overview](https://chettapay-docs.vercel.app/docs/getting-started/overview)       | What ChettaPay is and the problem it solves        |
| [API Keys](https://chettapay-docs.vercel.app/docs/getting-started/api-keys)       | Publishable vs secret keys, testnet vs mainnet  |
| [Quickstart](https://chettapay-docs.vercel.app/docs/getting-started/quickstart)   | Install, configure, and send your first payment |
| [Example App](https://chettapay-docs.vercel.app/docs/getting-started/example-app) | Clone and run a full working integration        |

---

## Core Concepts

| <br />                                                          | <br />                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| [Architecture](https://chettapay-docs.vercel.app/docs/core-concepts/architecture)               | How the SDK, ChettaPay Server, and Dashboard work together |
| [Funding Modes](https://chettapay-docs.vercel.app/docs/core-concepts/funding-modes)             | Immediate and Deferred wallet activation                |
| [Stellar Primitives](https://chettapay-docs.vercel.app/docs/core-concepts/stellar-primitives)   | Fee-bumps, reserves, trustlines, SEP-10, SEP-24         |
| [Security Model](https://chettapay-docs.vercel.app/docs/core-concepts/security-model)           | AWS KMS, Passkeys, BYOK, and MPC                        |
| [Transaction History](https://chettapay-docs.vercel.app/docs/core-concepts/transaction-history) | Two-layer history architecture and pagination           |

---

## SDK Reference

| <br />                                               | <br />                                          |
| ---------------------------------------------------- | ----------------------------------------------- |
| [@chettapay/react](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-react)   | Hooks and pre-built UI components               |
| [@chettapay/core](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-core)     | Full TypeScript client API                      |
| [Wallet Adapters](https://chettapay-docs.vercel.app/docs/sdk-reference/wallet-adapters) | External + embedded wallet login (Stellar Wallets Kit, Privy) |
| [ChettaPay Server API](https://chettapay-docs.vercel.app/docs/sdk-reference/server-api) | REST endpoints for backend use                  |
| [Webhooks](https://chettapay-docs.vercel.app/docs/sdk-reference/webhooks)            | Events, HMAC authentication, and retry behavior |
| [Error Codes](https://chettapay-docs.vercel.app/docs/sdk-reference/error-codes)      | All error codes with causes and fixes           |
| [MCP Gateway](https://chettapay-docs.vercel.app/docs/sdk-reference/mcp-gateway)      | MCP / AI-agent access via Personal Access Tokens |

---

## Operator Guide

The sections below mirror the Dashboard sidebar: **Overview · Build · Users · Treasury · Integrations · Monitor · Danger Zone**. Start with the [Dashboard Overview](https://chettapay-docs.vercel.app/docs/operator-guide/dashboard-overview).

**Overview**

| <br /> | <br /> |
| ------ | ------ |
| [Home](https://chettapay-docs.vercel.app/docs/operator-guide/overview/home)                 | Your app at a glance                  |
| [Get started](https://chettapay-docs.vercel.app/docs/operator-guide/overview/get-started)   | Onboarding checklist                  |

**Build**

| <br /> | <br /> |
| ------ | ------ |
| [Settings](https://chettapay-docs.vercel.app/docs/operator-guide/build/settings)   | App name and general configuration    |
| [API Keys](https://chettapay-docs.vercel.app/docs/operator-guide/build/api-keys)   | Generate and manage keys              |
| [Domains](https://chettapay-docs.vercel.app/docs/operator-guide/build/domains)     | Allowed origins for SDK requests      |
| [Webhooks](https://chettapay-docs.vercel.app/docs/operator-guide/build/webhooks)   | Event delivery endpoints (upcoming)   |
| [Branding](https://chettapay-docs.vercel.app/docs/operator-guide/build/branding)   | Customize the ChettaPay modals           |
| [Members](https://chettapay-docs.vercel.app/docs/operator-guide/build/members)     | Team access (owner only)              |

**Users**

| <br /> | <br /> |
| ------ | ------ |
| [Accounts](https://chettapay-docs.vercel.app/docs/operator-guide/users/accounts)   | Browse and manage app users           |
| [Wallets](https://chettapay-docs.vercel.app/docs/operator-guide/users/wallets)     | Browse and manage user wallets        |

**Treasury**

| <br /> | <br /> |
| ------ | ------ |
| [Tokens & Trustlines](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/tokens-trustlines) | Configure assets for user wallets |
| [Funding Mode](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/funding-mode)             | Immediate and Deferred (set on Account Funding) |
| [Account Funding](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/account-funding)       | Your funding (reserve) wallet     |
| [Sponsorship](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/sponsorship)               | Transaction fee sponsorship       |
| [Transaction Policy](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/transaction-policy) | Restrict sensitive operations (account merge, max fee) |
| [Auth Policy](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/auth-policy)               | Soroban authorization allowlist   |
| [Swap](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/swap)                             | Swap venues exposed to users      |
| [Earn](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/earn)                             | Yield providers (DeFindex, Blend) |
| [Token Distribution](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/token-distribution) | Claimable distribution rules      |

**Integrations**

| <br /> | <br /> |
| ------ | ------ |
| [Authentication](https://chettapay-docs.vercel.app/docs/operator-guide/integrations/authentication) | OAuth providers and email OTP (upcoming) |
| [KYC](https://chettapay-docs.vercel.app/docs/operator-guide/integrations/kyc)                        | Identity-verification providers (upcoming) |
| [Ramps](https://chettapay-docs.vercel.app/docs/operator-guide/integrations/ramps)                    | Fiat on/off-ramp providers        |
| [ChettaPay Checkout](https://chettapay-docs.vercel.app/docs/operator-guide/integrations/checkout)          | ChettaPay Checkout integration            |

**Monitor**

| <br /> | <br /> |
| ------ | ------ |
| [Transactions](https://chettapay-docs.vercel.app/docs/operator-guide/monitor/transactions) | On-chain transaction log             |
| [Logs](https://chettapay-docs.vercel.app/docs/operator-guide/monitor/logs)                 | API request and delivery logs        |
| [Alerts](https://chettapay-docs.vercel.app/docs/operator-guide/monitor/alerts)             | Low-balance notifications (upcoming) |

**Danger Zone**

| <br /> | <br /> |
| ------ | ------ |
| [Archive app](https://chettapay-docs.vercel.app/docs/operator-guide/danger-zone/archive-app) | Archive / unarchive the app (owner only) |

---

## Guides

| <br />                                                   | <br />                                    |
| -------------------------------------------------------- | ----------------------------------------- |
| [Deferred Flow Guide](https://chettapay-docs.vercel.app/docs/guides/deferred-flow-guide) | KYC-gated wallet activation with webhooks |
| [Passkeys Guide](https://chettapay-docs.vercel.app/docs/guides/passkeys-guide)           | Biometric auth with Face ID and Touch ID  |
| [Payments UI](https://chettapay-docs.vercel.app/docs/guides/payments-ui)                 | Send, receive, and history components     |
| [Mainnet Checklist](https://chettapay-docs.vercel.app/docs/guides/mainnet-checklist)     | Everything to verify before going live    |
