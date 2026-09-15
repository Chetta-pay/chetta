---
title: "Mainnet Checklist"
---

Before switching your app to Mainnet, verify every item in this checklist. There are no approval requirements from ChettaPay — this is a technical checklist you verify independently.

---

## Dashboard configuration

- [ ] Created a separate Mainnet app in the Dashboard (do not reuse your Testnet app)

- [ ] Generated `pub_mainnet_` and `sec_mainnet_` keys

- [ ] Added your production domain(s) in **Dashboard → Build → Domains**

- [ ] Funding mode configured correctly for your use case

- [ ] At least one asset configured in **Tokens / Trustlines**

- [ ] Branding & UI configured with your production logo and colors

---

## App Wallets

- [ ] Funding wallet active on Stellar Mainnet with sufficient XLM
  - Recommended minimum: 50 XLM to start

  - Calculate based on expected activations: `activations × (1 + assets × 0.5) XLM`

- [ ] Gas wallet active and funded
  - Recommended minimum: 10 XLM

- [ ] Distribution wallet funded (if distributing tokens)

- [ ] Low-balance alerts configured in **Dashboard → Monitor → Alerts**
  - At minimum: email alert for funding wallet below 20 XLM

---

## Environment variables

- [ ] `pub_mainnet_` key set in your production environment

- [ ] `sec_mainnet_` key set in your backend production environment

- [ ] No testnet keys present in production environment variables

- [ ] Keys not committed to version control

---

## Backend (Deferred mode only)

- [ ] `POST /v1/wallets/fund` endpoint deployed to production

- [ ] Endpoint uses `sec_mainnet_` secret key

- [ ] Endpoint validates input before calling ChettaPay

- [ ] `409 Conflict` response handled as success (wallet already active)

- [ ] `402 Payment Required` triggers an alert — your funding wallet needs a top-up

---

## SDK integration

- [ ] `ChettaPayProvider` uses production publishable key (`client={{ apiKey: 'pub_mainnet_...' }}`)

- [ ] No hardcoded testnet addresses or amounts

- [ ] Error handling implemented for transaction (`runTx` / `signAndSubmitTx`) failures — inspect the returned `SubmitOutcome.status`

- [ ] Unfunded wallets handled in the UI (Deferred mode — wallet exists but not yet activated)

- [ ] Token distribution rules configured in Dashboard if used

---

## Testing

- [ ] Full onboarding flow tested end-to-end on Mainnet with a real user account

- [ ] At least one real USDC payment sent and confirmed

- [ ] Transaction appears in **Dashboard → Monitor → Transactions**

- [ ] Wallet visible on [Stellar Expert](https://stellar.expert)

- [ ] Webhook events received correctly (if configured)

---

## Observability

- [ ] **Dashboard → Monitor → Logs** monitored after first real users

- [ ] Error alerting set up (Sentry, Datadog, or similar) for your backend

- [ ] Sponsorship wallet balances checked after first day of real usage

---

## Stellar network reference

- Mainnet passphrase: `Public Global Stellar Network ; September 2015`

- Mainnet Stellar Expert: [stellar.expert](https://stellar.expert)

- Network status: [status.stellar.org](https://status.stellar.org)

> Full network details at [developers.stellar.org/docs/networks](https://developers.stellar.org/docs/networks).
