---
title: "Transaction History"
---

ChettaPay provides complete transaction history for every wallet through two complementary layers — one from the Stellar network and one from ChettaPay's own database.

---

## Two-layer architecture

```mermaid
flowchart LR
    subgraph sources["Data sources"]
        A("Stellar RPC\nLast 7 days"):::stellar
        B("ChettaPay PostgreSQL\nFull history"):::db
    end

    C("ChettaPay Server"):::server
    D("Your App\nSDK · REST API"):::app

    A -->|"recent txs"| C
    B -->|"full history"| C
    C -->|"merged, paginated"| D

    classDef stellar fill:#faeeda,stroke:#ba7517,color:#633806
    classDef db fill:#e6f1fb,stroke:#378add,color:#0c447c
    classDef server fill:#eeedfe,stroke:#7f77dd,color:#3c3489
    classDef app fill:#e1f5ee,stroke:#1d9e75,color:#085041
```

| Layer  | Source            | Retention  |
| ------ | ----------------- | ---------- |
| Recent | Stellar RPC       | 7 days     |
| Full   | ChettaPay PostgreSQL | Indefinite |

The ChettaPay Server captures every transaction at fee-bump signing time and persists it to PostgreSQL. Because ChettaPay processes all fee-bumps for your app, it has full visibility without indexing the entire blockchain.

> Horizon (the older Stellar API) is formally deprecated by SDF. ChettaPay uses Stellar RPC exclusively.

---

## SDK — React hook

`txHistory` is a reactive state machine (`TxHistoryState`). Trigger a load with `fetchTxHistory()` on the underlying client; the provider keeps `txHistory` in sync.

```tsx
'use client';
import { useEffect } from 'react';
import { useChettaPay } from '@chettapay/react';

export function TxHistory() {
  const { txHistory, getClient } = useChettaPay();

  useEffect(() => {
    getClient().fetchTxHistory({ limit: 20, offset: 0 });
  }, [getClient]);

  if (txHistory.step !== 'loaded') return <p>Loading...</p>;

  return (
    <ul>
      {txHistory.data.records.map((tx) => (
        <li key={tx.id}>
          {tx.summary} · {tx.status} · {new Date(tx.createdAt).toLocaleDateString()}
        </li>
      ))}
    </ul>
  );
}
```

> The simplest path is the built-in modal: call `openTxHistoryModal()` from `useChettaPay()`.

## SDK — Core client

```typescript
await chettapay.fetchTxHistory({ limit: 20, offset: 0 });

const state = chettapay.getTxHistoryState();
if (state.step === 'loaded') {
  console.log(state.data.records, state.data.total);
}
```

`fetchTxHistory` drives `TxHistoryState` (it does not return the records directly). Subscribe with `onTxHistoryStateChange` for updates.

---

## REST API

The end-user transaction history is served by the SDK API (publishable key + authenticated end-user session), not by the secret-key Server API:

```bash
GET https://chettapay-api.vercel.app/v1/tx/history?limit=20&offset=0
```

> There is currently **no secret-key Server API endpoint** for wallet transaction history. Use the SDK (`fetchTxHistory`) from an authenticated session.

**Query parameters:**

| Parameter | Type     | Default | Description                          |
| --------- | -------- | ------- | ------------------------------------ |
| `limit`   | `number` | —       | Records per page.                    |
| `offset`  | `number` | `0`     | Offset for pagination.               |
| `network` | `string` | session | `testnet` or `mainnet`.              |

**Response (`content`):**

```json
{
  "records": [
    {
      "id": "tx_abc123",
      "hash": "a1b2c3d4...",
      "network": "testnet",
      "status": "SUCCESS",
      "operation": "payment",
      "feeXlm": "0.00001",
      "summary": "Sent 10.00 USDC",
      "createdAt": "2026-03-15T10:30:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

---

## Pagination

History uses **offset-based** pagination. Increase `offset` by `limit` to page forward; `total` tells you when to stop.

```typescript
async function getAllTransactions() {
  const all = [];
  let offset = 0;
  const limit = 100;

  for (;;) {
    await chettapay.fetchTxHistory({ limit, offset });
    const state = chettapay.getTxHistoryState();
    if (state.step !== 'loaded') break;
    all.push(...state.data.records);
    offset += limit;
    if (offset >= state.data.total) break;
  }

  return all;
}
```

---

## Transaction status

Each record carries a `status` reflecting its lifecycle:

| Status    | Description                                  |
| --------- | -------------------------------------------- |
| `PENDING` | Built/submitted, not yet confirmed on-chain. |
| `SUCCESS` | Confirmed on-chain.                          |
| `FAILED`  | Rejected by Stellar.                         |

The human-readable `operation` and `summary` fields describe what the transaction did.

---

## Record type

```typescript
type TxHistoryRecord = {
  id: string;
  hash: string;
  network: 'testnet' | 'mainnet';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  operation: string;
  feeXlm?: string;
  resultCode?: string;
  summary: string;
  createdAt: string; // ISO 8601
};
```
