---
title: "Token Distribution"
---

**Dashboard → Treasury → Token Distribution**

Configures **distribution rules** — assets your app makes available from its distribution wallet for users to claim. Users claim them from the SDK (`openDistributionRulesModal()`, or `getClient().listDistributionRules()` / `claimDistributionRule()`).

---

## Distribution rules

Create a rule per asset you want to distribute. Only assets enabled here can be claimed — claiming an unconfigured asset returns `DISTRIBUTION_ASSET_NOT_ENABLED`.

For each rule, configure:

| Setting           | Description                                                |
|-------------------|------------------------------------------------------------|
| **Asset**         | The asset to distribute (must be enabled for the app)      |
| **Amount per claim** | How much a user receives per claim                      |
| **Validity window** | When the rule starts/ends (claims outside it fail)       |
| **Rate limit**    | Max claims per user per period                             |

Relevant errors: `DISTRIBUTION_RULE_NOT_FOUND`, `DISTRIBUTION_RULE_DISABLED`, `DISTRIBUTION_RULE_NOT_STARTED`, `DISTRIBUTION_RULE_EXPIRED`, `DISTRIBUTION_RULE_EXHAUSTED`, `DISTRIBUTION_RATE_LIMIT_EXCEEDED`.

---

## Distribution wallet

Claims are paid from the app's **distribution wallet**. If none is configured, claims fail with `DISTRIBUTION_NO_DISTRIBUTION_WALLET`. Fund it by sending assets directly to its G-address, or via the **Fund wallet** button in [App Wallets](https://chettapay-docs.vercel.app/docs/operator-guide/treasury/account-funding).