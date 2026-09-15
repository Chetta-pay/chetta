---
title: "KYC `upcoming`"
---

**Dashboard → Integrations → KYC**

> 🚧 **Not yet available.** The KYC configuration page is gated behind a "coming soon" state in the dashboard.

Connect identity-verification providers so you can gate features — for example, activating a wallet in [Deferred](https://chettapay-docs.vercel.app/docs/core-concepts/funding-modes) mode only after a user passes KYC.

The SDK side already exists: `getClient().getKycProviders()`, `startKyc()`, and `getKycStatus()` from [`@chettapay/core`](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-core), plus `openKycModal()` from [`@chettapay/react`](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-react). What's upcoming is the per-app provider configuration UI here.
