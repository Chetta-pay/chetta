---
title: "Branding"
---

**Dashboard → Build → Branding**

Customize the appearance of the SDK login modal — the pre-built `WalletButton` / login component from `@chettapay/react`.

---

## What you can customize

| Setting | Description |
|---|---|
| **Theme** | Modal appearance: **Light** or **Dark** |
| **Accent color** | Main modal color. Left unset, it follows the theme: `#A2590D` (Chetta amber) on Light, `#E8A33D` (Chetta gold) on Dark, which is the pairing that stays legible on each background. Set it, and your color is used on both. |
| **Logo** | Logo displayed in the login modal (PNG, JPG, SVG, WEBP — max 1 MB) |
| **Login methods** | Toggle **Email** login on/off. **Social providers** are marked _Coming soon_ and are not individually toggleable yet. |
| **Wallets** | **Embedded wallets** and **Smart Wallet (passkey)** options |

> App name is edited in **Build → Settings**, not here.

---

## Preview

The Dashboard shows a live preview of the branded surfaces as you make changes, with tabs for **Login**, **KYC**, **Transaction**, **Tx History**, **Balance**, **Ramp**, and **Button**. You can also **Export configuration**.

Changes apply immediately — no SDK update or redeployment required.