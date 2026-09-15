import { ChettaPayProvider, useChettaPay, type ChettaPayConfig, CHETTA } from '@chettapay/react';
import { solanaWalletStandardAdapters } from '@chettapay/solana-wallet-standard-adapter';

const CHETTAPAY_API_KEY = import.meta.env.VITE_CHETTAPAY_API_KEY as string | undefined;
const CHETTAPAY_BASE_URL = import.meta.env.VITE_CHETTAPAY_BASE_URL as string | undefined;

// Discover installed Solana wallets (Phantom, Solflare, Backpack, …) through the
// Wallet Standard, one adapter each. SSR-safe (returns [] server-side); here it
// runs in the browser, so any injected wallet is picked up. login({ provider })
// then runs the SIWS flow in @chettapay/core.
const solanaAdapters = solanaWalletStandardAdapters();

// The accent is spelled out rather than left to default so this file also shows
// where an integrator swaps in their own brand color.
const appConfig: ChettaPayConfig = {
  application: { name: 'Solana Wallet Standard Example', network: 'testnet', chains: ['SOLANA'] },
  styles: { theme: 'light', accentColor: CHETTA.amber },
};

function Brand() {
  return (
    <div className="brand">
      <img className="brand-mark" src="/chetta-mark.svg" alt="" width={40} height={40} />
      <div className="brand-name">
        Chetta<span>Pay</span>
      </div>
    </div>
  );
}

function Home() {
  const { wallet, isAuthenticated, verified, openLoginModal, logout } = useChettaPay();
  const noWallet = solanaAdapters.length === 0;

  return (
    <main className="shell">
      <Brand />
      <div className="card">
        <h1>Solana Wallet Standard</h1>
        {noWallet ? (
          <p>No Solana wallet detected. Install Phantom, Solflare or Backpack, then reload this page.</p>
        ) : isAuthenticated && wallet ? (
          <>
            <div className="chip">
              {wallet.custody} &middot; {verified ? 'verified' : 'optimistic'}
            </div>
            <p>Logged in over Sign In With Solana. The session is bound to a DPoP keypair this browser holds.</p>
            <pre className="address mono">{wallet.address}</pre>
            <button className="btn" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <p>Log in, choose your Solana wallet, and approve the Sign In With Solana request.</p>
            <button className="btn" onClick={openLoginModal}>
              Log in
            </button>
          </>
        )}
      </div>
      <p className="footnote">
        {noWallet
          ? 'Waiting for an injected wallet.'
          : `${solanaAdapters.length} wallet${solanaAdapters.length === 1 ? '' : 's'} detected.`}
      </p>
    </main>
  );
}

function Setup() {
  return (
    <main className="shell">
      <Brand />
      <div className="card">
        <h1>Setup needed</h1>
        <p>
          Copy <code>.env.example</code> to <code>.env.local</code> and set <code>VITE_CHETTAPAY_API_KEY</code> to an
          application with SOLANA enabled.
        </p>
        <p>
          Then restart <code>npm run dev</code>.
        </p>
      </div>
    </main>
  );
}

export function App() {
  if (!CHETTAPAY_API_KEY) {
    return <Setup />;
  }
  return (
    <ChettaPayProvider
      client={{
        apiKey: CHETTAPAY_API_KEY,
        walletAdapters: solanaAdapters,
        ...(CHETTAPAY_BASE_URL ? { baseUrl: CHETTAPAY_BASE_URL } : {}),
      }}
      appConfig={appConfig}
    >
      <Home />
    </ChettaPayProvider>
  );
}
