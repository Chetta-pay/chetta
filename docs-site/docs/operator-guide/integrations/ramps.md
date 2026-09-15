---
title: "Ramps"
---

**Dashboard → Integrations → Ramps**

Configure fiat on/off-ramp providers so users can deposit and withdraw real money directly in your app via a modal.

---

## Fiat Ramps

Enable a provider, add its credentials, and select the corridors/assets to support.

### Supported providers

| Provider           | Type              | Notes                                                           |
|--------------------|-------------------|-----------------------------------------------------------------|
| **Bridge**         | REST (bridge.xyz) | BRL ↔ USDC on Stellar, via Pix. Hosted KYC.                     |
| **PagFinance**     | REST              | BRL ↔ USDC on Stellar, via Pix. On-ramp live; off-ramp pending. |
| **Abroad Finance** | REST              | Off-ramp only — BRL (Pix) and COP (BreB) from USDC on Stellar.  |
| **Etherfuse**      | REST              | MXN ↔ USDC on Stellar, via SPEI. Per-user hosted KYC.           |
| **Stereum**        | REST              | BOB ↔ USDC on Stellar — buy by bank QR, sell to a bank account. |
| **Anclap**         | SEP-24            | USDC and local stablecoins (any SEP-24 anchor).                 |

The real unit of a ramp is the **corridor**: direction + country + fiat + rail + the on-chain asset the user ends up
with. Corridors are seeded from what the backend can actually execute — from the adapter's capability matrix for REST
providers, from the anchor's `stellar.toml` + SEP-24 `/info` for Anclap — so the dashboard can never enable a route with
no code behind it. You own the overrides: turn a corridor off, or tighten its minimum and maximum amount.

| Provider       | Direction | Country | Fiat | Rail | User's asset    |
|----------------|-----------|---------|------|------|-----------------|
| Bridge         | Buy, Sell | BR      | BRL  | Pix  | USDC on Stellar |
| PagFinance     | Buy, Sell | BR      | BRL  | Pix  | USDC on Stellar |
| Abroad Finance | Sell      | BR      | BRL  | Pix  | USDC on Stellar |
| Abroad Finance | Sell      | CO      | COP  | BreB | USDC on Stellar |
| Etherfuse      | Buy, Sell | MX      | MXN  | SPEI | USDC on Stellar |
| Stereum        | Buy       | BO      | BOB  | QR   | USDC on Stellar |
| Stereum        | Sell      | BO      | BOB  | ACH  | USDC on Stellar |

Two providers do not settle on Stellar natively and are bridged through Circle CCTP: **Stereum** moves USDT on Polygon,
and **PagFinance** is paid USDC on Solana by its Partner API. Both bridges are internal plumbing — your users only ever
hold USDC on Stellar, and never need a wallet on the other chain.

PagFinance's off-ramp is not open yet: it pays into a receiver shared across orders, and ChettaPay will not send funds it
cannot attribute back to a single order, so a sell attempt is recorded and then declined.

Each provider is configured with its own credentials (base URL + API keys) and, where applicable, its enabled corridors.
Assets you enable must also be configured
in [Tokens / Trustlines](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/tokens-trustlines).

Once enabled, the ramp modal is available via `openRampModal()` in the SDK:

```tsx
const { openRampModal } = useChettaPay();

<button onClick={openRampModal}>
  Deposit / Withdraw
</button>
```

For headless control over quotes and on/off-ramp creation, use `getClient().getRampsQuote()`, `createOnRamp()`, and
`createOffRamp()`.

---

## More integrations `coming soon`

| Integration   | Description                                                                         |
|---------------|-------------------------------------------------------------------------------------|
| KYC providers | Connect Jumio, Persona, or Sumsub to trigger Deferred mode activation automatically |
| Analytics     | Send wallet and payment events to Mixpanel, Amplitude, or Segment                   |
