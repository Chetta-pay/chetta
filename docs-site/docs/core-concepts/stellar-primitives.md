---
title: "Stellar Primitives"
---

ChettaPay is built on top of specific Stellar protocol features. You don't need to know Stellar deeply to use ChettaPay — but understanding these primitives helps you make better decisions about funding modes, security, and fiat ramps.

---

## Account model

Stellar accounts are identified by a **G-address** (a public key starting with `G`). Every account must hold a minimum **XLM reserve** to exist on-chain — currently 1 XLM base reserve plus 0.5 XLM per entry (trustlines, offers, etc.).

This is different from EVM chains, where an address exists as soon as someone sends funds to it.

**What ChettaPay does:** Creates the G-address for your user and manages the XLM reserve on their behalf, so users never need to know what a reserve is or where to get XLM.

---

## Fee-bump transactions

Every Stellar transaction requires a small XLM fee paid by the submitter. Without fee-bumps, users would need XLM before they can do anything — a problem for new users who have never held crypto.

Fee-bump transactions solve this: a third party (the sponsor) wraps the user's transaction and pays the fee on their behalf. The user's transaction is valid, the sponsor pays, and the user needs zero XLM.

**What ChettaPay does:** The ChettaPay Server maintains a sponsor keypair for your app. Every transaction submitted through the SDK is automatically wrapped in a fee-bump, paid from your app's gas wallet.

```
User transaction (inner tx)
└── Fee-bump wrapper (outer tx)
    └── Signed by ChettaPay sponsor
    └── Fee paid from your gas wallet
```

---

## Account sponsorship

Beyond fee-bumps, Stellar has a native sponsorship model for account reserves. A sponsor can cover the XLM reserve of another account using `beginSponsoringFutureReserves` / `endSponsoringFutureReserves`.

This is what enables ChettaPay's Deferred mode: the G-address exists on-chain with no reserve until activation, at which point ChettaPay executes the sponsorship sequence atomically.

```
beginSponsoringFutureReserves(userAddress)
  createAccount(userAddress, startingBalance: 0)
  changeTrust(USDC, source: userAddress)
endSponsoringFutureReserves(source: userAddress)
```

If any operation fails, the entire transaction reverts — no partial states.

---

## Trustlines

In Stellar, an account must explicitly opt in to hold an asset by creating a **trustline**. Without a trustline for USDC, an account cannot receive or hold it.

**What ChettaPay does:** Automatically enables trustlines for all assets configured in your Dashboard at wallet creation or activation. If no assets are configured, no trustlines are set up. Users never see a trustline prompt.

---

## SEP-10 — Stellar Web Authentication

SEP-10 is a Stellar standard for authenticating ownership of a Stellar account using a challenge-response mechanism — no passwords, no email, just a signed Stellar transaction.

**What ChettaPay uses it for:** Authenticating operators in the Dashboard. When you sign in to `chettapay-dashboard.vercel.app`, your Stellar wallet signs a challenge proving you own the account.

---

## SEP-24 — Hosted Deposit and Withdrawal

SEP-24 is a Stellar standard for fiat on/off-ramps. It defines a protocol between a wallet app and an **anchor** (a licensed financial institution) for depositing and withdrawing fiat currency in exchange for Stellar assets like USDC.

**What ChettaPay uses it for:** Embedding fiat deposit and withdrawal flows directly in your app via a modal. Activate SEP-24 with a single flag in the Dashboard.

---

## SEP-7 — Payment Request URIs `coming soon`

SEP-7 defines a URI scheme for Stellar payment requests — similar to Bitcoin's `bitcoin:` URIs. A SEP-7 URI encodes destination, asset, amount, and memo so any compatible wallet can pre-fill a payment form by scanning a QR code or opening a link.

**What ChettaPay will use it for:** The receive flow — QR codes and shareable payment links that work with any SEP-7 compatible Stellar wallet.

---

## Quick reference

| Primitive | Used in ChettaPay for |
|---|---|
| G-address + XLM reserve | Wallet creation, funding modes |
| Fee-bump transactions | Gas sponsorship — users pay zero XLM |
| Account sponsorship | Deferred funding mode and manual activation |
| Trustlines | Automatic asset enablement on activation |
| SEP-10 | Dashboard authentication |
| SEP-24 | Fiat deposit and withdrawal |
| SEP-7 | Receive QR codes and payment links (`coming soon`) |