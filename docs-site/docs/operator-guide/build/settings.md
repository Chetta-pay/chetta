---
title: "Settings"
---

**Dashboard → Build → Settings**

General configuration for your ChettaPay app.

---

## Application name

The display name for your app. Shown in the Dashboard and in the `WalletButton` modal header.

---

## Application state & network

Shows whether this app is configured for **Testnet** or **Mainnet**, and the app's state. Network is set at app creation and **cannot be changed** — to use a different network, create a new app (or use the network selector in the top navigation bar to switch between your Testnet and Mainnet environments).

> Allowed origins are **not** configured here. They live under **Build → Domains**.

---

## Auth settings

Control the lifetimes of the tokens the SDK issues to end-users:

- **Access token TTL** — in minutes (bounded by server-side limits).
- **Refresh token TTL** — in days (bounded by server-side limits).

Leave a field empty to use the platform default.

---

## App ID

The app's identifier, used to associate your ChettaPay client with this app. Read-only.

---

> To remove an app, use **Danger Zone → Archive app**. Archiving disables the app's API keys and SDK access and is reversible (unarchive). There is no permanent "delete" action.