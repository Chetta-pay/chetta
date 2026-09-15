---
title: "Webhooks `upcoming`"
---

**Dashboard → Build → Webhooks**

> 🚧 **Not yet available.** The Webhooks page exists in the dashboard but is gated behind a "coming soon" state — endpoints cannot be delivered to in production yet. Event types, signature verification, and the retry policy below describe the **planned** design. See the [Webhooks reference](https://chettapay-docs.vercel.app/docs/sdk-reference/webhooks) for the current internal behavior.

Configure URLs where ChettaPay sends event notifications when things happen in your app.

---

## Adding a webhook endpoint

1. Click **Add endpoint**
2. Enter your URL (must be HTTPS in production)
3. Select which events to receive
4. Copy the **Webhook secret** — used to verify incoming requests

---

## Verifying webhook signatures

Every request includes an `X-ChettaPay-Signature` header. Verify it before processing:

```typescript
import { createHmac } from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return `sha256=${expected}` === signature;
}
```

Always respond with `200` immediately. ChettaPay retries failed deliveries with exponential backoff — see [Webhooks reference](https://chettapay-docs.vercel.app/docs/sdk-reference/webhooks) for the full retry policy and event formats.

---

## Event log

**Dashboard → Build → Webhooks → Event log** shows every delivery attempt — timestamp, event type, response code, and latency. Use this to debug failed deliveries or verify that events are being received correctly.
