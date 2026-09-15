---
title: "Webhooks"
---

ChettaPay uses webhooks in two directions:

- **Inbound** — your backend receives a call from ChettaPay when an event occurs

- **Outbound** — your backend calls ChettaPay to trigger an action (e.g. `POST /v1/wallets/fund`)

---

## Inbound webhooks `upcoming`

> 🚧 **Not yet available.** Inbound event webhooks are on the roadmap and **not implemented in production yet**. The dashboard configuration page is gated behind a "coming soon" state, and the semantic events, signature convention, and retry schedule documented below describe the **planned** design so you can prepare your integration — they are not live.
>
> What exists today is an internal, generic on-chain delivery: a single `stellar.tx` event carrying raw Stellar operation data, posted once (no retry/backoff) with an `X-ChettaPay-Signature: sha256=<hmac>` header. The structured `wallet.*` / `payment.*` events below are not emitted yet.

When available, you'll configure a webhook URL in **Build → Webhooks**. ChettaPay sends a `POST` request to your URL when an event occurs.

### Authentication

Every request includes an `X-ChettaPay-Signature` header — an HMAC-SHA256 signature of the raw request body using your webhook secret.

```typescript
import { createHmac } from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return `sha256=${expected}` === signature;
}

// Next.js API route
export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('x-chettapay-signature') ?? '';

  if (!verifyWebhook(payload, signature, process.env.CHETTAPAY_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(payload);
  // handle event...
  return NextResponse.json({ received: true });
}
```

Always respond with `200` as quickly as possible. If your endpoint returns a non-2xx status or times out, ChettaPay retries with exponential backoff.

### Retry policy `upcoming`

> Planned design — there is **no retry/backoff implemented today**. The current internal delivery posts once and logs failures.

| Attempt | Delay      |
| ------- | ---------- |
| 1       | Immediate  |
| 2       | 1 minute   |
| 3       | 10 minutes |
| 4       | 1 hour     |
| 5       | 24 hours   |

After 5 failed attempts the event is marked as failed and visible in **Build → Webhooks → Event log**.

---

## Events `upcoming`

> These semantic event types are **planned, not yet emitted**. The server currently only delivers a generic `stellar.tx` payload with raw operation data.

### `wallet.created`

Fired when a new wallet G-address is created on-chain.

```json
{
  "event": "wallet.created",
  "timestamp": "2026-03-15T10:00:00Z",
  "data": {
    "walletId": "wal_abc123",
    "address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "status": "pending"
  }
}
```

### `wallet.activated`

Fired when a wallet is successfully funded and active on-chain.

```json
{
  "event": "wallet.activated",
  "timestamp": "2026-03-15T10:30:00Z",
  "data": {
    "walletId": "wal_abc123",
    "address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "activatedAt": "2026-03-15T10:30:00Z"
  }
}
```

### `wallet.funded`

Fired when `fund()` distributes assets from the distribution wallet.

```json
{
  "event": "wallet.funded",
  "timestamp": "2026-03-15T11:10:00Z",
  "data": {
    "walletId": "wal_abc123",
    "asset": "USDC",
    "amount": "100.00",
    "txHash": "c3d4e5f6..."
  }
}
```

### `payment.sent`

Fired when a payment is confirmed on-chain.

```json
{
  "event": "payment.sent",
  "timestamp": "2026-03-15T11:00:00Z",
  "data": {
    "txHash": "a1b2c3d4...",
    "fromWalletId": "wal_abc123",
    "from": "GABC...",
    "to": "GXYZ...",
    "asset": "USDC",
    "amount": "10.00",
    "ledger": 1234567
  }
}
```

### `payment.received`

Fired when a wallet receives a payment from any Stellar address.

```json
{
  "event": "payment.received",
  "timestamp": "2026-03-15T11:05:00Z",
  "data": {
    "txHash": "b2c3d4e5...",
    "toWalletId": "wal_abc123",
    "from": "GXYZ...",
    "to": "GABC...",
    "asset": "USDC",
    "amount": "25.00",
    "ledger": 1234600
  }
}
```

### `trustline.added`

Fired when a trustline is enabled on a user wallet.

```json
{
  "event": "trustline.added",
  "timestamp": "2026-03-15T10:01:00Z",
  "data": {
    "walletId": "wal_abc123",
    "asset": "USDC"
  }
}
```

### `sponsor.balance.low`

Fired when any sponsorship wallet drops below its configured minimum threshold.

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

---

## Outbound webhooks

Your backend calls ChettaPay to trigger actions. Currently:

- `POST /v1/wallets/fund` — see [Server API](https://chettapay-docs.vercel.app/docs/sdk-reference/server-api)
