---
title: "Wallets"
---

**Dashboard → Integrations → Wallets** `hidden`

> 🚧 This section is **currently hidden from the dashboard**. It configured a server-side wallet provider / adapter (bring-your-own custody). The server-side custodian backend is intentionally kept, and the section will return when the next server-side adapter integration ships.

For **client-side** wallet login today — connecting external Stellar wallets (Freighter, Albedo, xBull, Lobstr, …) or Privy embedded wallets — you register adapters on the SDK, not in the dashboard. See [Wallet Adapters](https://chettapay-docs.vercel.app/docs/sdk-reference/wallet-adapters).

By default, ChettaPay provisions built-in **custodial** wallets (social / email login, platform-custodied G-address); no configuration is required.

> Not to be confused with **Users → Wallets**, which lists the actual end-user wallets created in your app.
