---
title: "Alerts"
---

**Dashboard → Monitor → Alerts** `upcoming`

Configure notifications for low wallet balances so you never run out of funds unexpectedly.

---

## Alert channels

| Channel     | Setup                                                                         |
| ----------- | ----------------------------------------------------------------------------- |
| **Email**   | Add one or more email addresses — alerts are sent when a threshold is crossed |
| **Webhook** | Add a webhook URL — ChettaPay sends a `sponsor.balance.low` event                |

---

## Per-wallet thresholds

Set independent thresholds for each operator wallet:

| Wallet              | Suggested threshold                  |
| ------------------- | ------------------------------------ |
| Funding wallet      | 20 XLM                               |
| Gas wallet          | 5 XLM                                |
| Distribution wallet | Depends on asset and expected volume |

When a wallet drops below its threshold, ChettaPay sends an alert immediately and repeats every 24 hours until the wallet is topped up.

---

## `sponsor.balance.low` event

```json
{
  "event": "sponsor.balance.low",
  "timestamp": "2026-03-15T12:00:00Z",
  "data": {
    "walletType": "funding",
    "address": "GSPONSOR...",
    "balance": "5.00",
    "threshold": "10.00",
    "asset": "XLM"
  }
}
```

See [Webhooks](https://chettapay-docs.vercel.app/docs/sdk-reference/webhooks) for the full event reference.
