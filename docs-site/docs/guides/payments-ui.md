---
title: "Payments UI"
---

This guide covers how to implement send, receive, and transaction history flows in your app using ChettaPay's hooks and pre-built components.

---

All payment functionality is exposed through the single `useChettaPay()` hook.

## Send

### Using `runTx('payment', ...)`

`runTx` is the one-shot helper (build → sign → submit). The returned `SubmitOutcome` has a `status` of `'success'`, `'pending'`, or `'error'`.

```tsx
'use client';
import { useChettaPay } from '@chettapay/react';
import { useState } from 'react';

const USDC = { type: 'credit_alphanum4', code: 'USDC', issuer: 'GA5Z...' } as const;

export function SendForm() {
  const { runTx, tx } = useChettaPay();
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const sending = tx.step !== 'idle' && tx.step !== 'success' && tx.step !== 'error';

  async function handleSend() {
    const result = await runTx('payment', { destination: to, amount, asset: USDC });
    if (result.status === 'success') console.log('Confirmed:', result.hash);
  }

  return (
    <div>
      <input
        placeholder="Recipient G-address"
        value={to}
        onChange={e => setTo(e.target.value)}
      />
      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <button onClick={handleSend} disabled={sending}>
        {sending ? 'Sending...' : 'Send USDC'}
      </button>
    </div>
  );
}
```

For a native XLM payment, use `asset: { type: 'native' }`. For step-by-step control over building and signing, use `buildTx()` then `signAndSubmitTx()` — see [`@chettapay/core`](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-core).

### With memo

Memos are useful for identifying payments on the recipient's side — common in remittance and payroll apps. Pass a `memo` in the third `options` argument:

```tsx
await runTx(
  'payment',
  { destination: 'GXXX...', amount: '100.00', asset: USDC },
  { memo: { type: 'text', value: 'Payroll March 2026' } },
);
```

### Pre-built send modal

ChettaPay ships a ready-made send flow (address input, asset selector, amount field, confirmation). Open it programmatically — appearance is customizable from **Build → Branding**:

```tsx
const { openSendModal } = useChettaPay();
// ...
<button onClick={openSendModal}>Send</button>
```

---

## Receive

### Showing the user's address

The authenticated wallet is exposed as `wallet` — read its on-chain address from `wallet.address`:

```tsx
'use client';
import { useChettaPay } from '@chettapay/react';

export function ReceiveView() {
  const { wallet } = useChettaPay();

  async function copyAddress() {
    if (wallet) await navigator.clipboard.writeText(wallet.address);
  }

  return (
    <div>
      <p>{wallet?.address}</p>
      <button onClick={copyAddress}>Copy address</button>
    </div>
  );
}
```

### QR code

Generate a QR code from the wallet address using any QR library:

```tsx
import QRCode from 'qrcode.react';
import { useChettaPay } from '@chettapay/react';

export function ReceiveQR() {
  const { wallet } = useChettaPay();

  if (!wallet) return null;
  return <QRCode value={wallet.address} size={200} />;
}
```

### Pre-built receive modal

ChettaPay ships a ready-made receive view (QR + copyable address). Open it with `openReceiveModal()`:

```tsx
const { openReceiveModal } = useChettaPay();
// ...
<button onClick={openReceiveModal}>Receive</button>
```

### SEP-7 payment request URI `coming soon`

SEP-7 encodes destination, asset, amount, and memo into a single URI that any compatible Stellar wallet can scan to pre-fill a payment form:

```
web+stellar:pay?destination=GXXX&asset_code=USDC&asset_issuer=GXXX&amount=10
```

---

## Transaction history

### Using the `txHistory` state

`txHistory` is a reactive state machine. Trigger a load through the underlying client and render `txHistory.data.records` once it reaches `loaded`:

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
      {txHistory.data.records.map(tx => (
        <li key={tx.id}>
          <span>{tx.summary}</span>
          <span>{tx.status}</span>
          <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
        </li>
      ))}
    </ul>
  );
}
```

See [Transaction History](https://chettapay-docs.vercel.app/docs/core-concepts/transaction-history) for the record fields and offset-based pagination.

### Pre-built history modal

`openTxHistoryModal()` renders a ready-made, paginated history list:

```tsx
const { openTxHistoryModal } = useChettaPay();
// ...
<button onClick={openTxHistoryModal}>History</button>
```

---

## Asset balances

### Reading balances from the wallet

`walletBalance` is a reactive state machine; call `refreshWalletBalance()` to load it. Each balance record exposes `code`, `balance`, `available`, `type`, and `enabledInApp`.

```tsx
'use client';
import { useEffect } from 'react';
import { useChettaPay } from '@chettapay/react';

export function Balances() {
  const { walletBalance, refreshWalletBalance } = useChettaPay();

  useEffect(() => { refreshWalletBalance(); }, [refreshWalletBalance]);

  if (walletBalance.step !== 'loaded') return <p>Loading...</p>;

  return (
    <ul>
      {walletBalance.data.balances.map(b => (
        <li key={b.code}>
          {b.balance} {b.code}
        </li>
      ))}
    </ul>
  );
}
```

### Pre-built balance modal

`openWalletBalanceModal()` renders a ready-made balance view with a manual refresh.

---

## Fiat on/off-ramp

Ramps integrate third-party providers (configure them under **Integrations → Ramps**). Open the pre-built widget with `openRampModal()`:

```tsx
'use client';
import { useChettaPay } from '@chettapay/react';

export function FiatButton() {
  const { openRampModal } = useChettaPay();

  return <button onClick={openRampModal}>Deposit / Withdraw</button>;
}
```

For headless control over quotes and on/off-ramp creation, use `getClient().getRampsQuote()`, `createOnRamp()`, and `createOffRamp()` from [`@chettapay/core`](https://chettapay-docs.vercel.app/docs/sdk-reference/chettapay-core).

See [Fiat Ramps](https://chettapay-docs.vercel.app/docs/operator-guide/integrations/ramps) for setup.
