# @chettapay-examples/solana-web

Minimal Vite + React app to manually e2e-test
[`@chettapay/solana-wallet-standard-adapter`](../../packages/solana-wallet-standard-adapter)
against a real Solana wallet (Phantom, Solflare, Backpack). It wires the adapter
into `@chettapay/react` and runs the Sign In With Solana (SIWS) login.

## The wiring

That is the whole integration — discover the wallets and hand them to
`ChettaPayProvider`:

```tsx
import { solanaWalletStandardAdapters } from '@chettapay/solana-wallet-standard-adapter';

const solanaAdapters = solanaWalletStandardAdapters();

<ChettaPayProvider client={{ apiKey, walletAdapters: solanaAdapters }} appConfig={appConfig}>
  <App />
</ChettaPayProvider>;
```

`login({ provider })` (the login modal button) then runs the SIWS flow in
`@chettapay/core`: it requests a SIWS input from `/auth/wallet/solana/challenge`, the
wallet signs it (`solana:signIn`), and the signature is verified at
`/auth/wallet/solana`.

## Run it

1. `cp .env.example .env.local` and set `VITE_CHETTAPAY_API_KEY` (an app that has
   SOLANA enabled). Point `VITE_CHETTAPAY_BASE_URL` at your sdk-api if testing the
   local backend.
2. From the repo root: `npm run build` (so the workspace packages are built), then
   `npm run dev -w @chettapay-examples/solana-web`.
3. Open http://localhost:5174, click **Log in**, pick your wallet, approve the
   sign-in request.

> Requires a wallet that supports the `solana:signIn` (SIWS) feature. Phantom,
> Solflare, and Backpack do.
