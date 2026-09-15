import { ChettaPayProvider, useChettaPay, type ChettaPayConfig, CHETTA } from '@chettapay/react';
import { createPrivyAdapter, PrivyAdapterProvider } from '@chettapay/privy-adapter';

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string | undefined;
const CHETTAPAY_API_KEY = import.meta.env.VITE_CHETTAPAY_API_KEY as string | undefined;
const CHETTAPAY_BASE_URL = import.meta.env.VITE_CHETTAPAY_BASE_URL as string | undefined;
const STELLAR_NETWORK = (import.meta.env.VITE_STELLAR_NETWORK as 'testnet' | 'mainnet' | undefined) ?? 'testnet';

// Build the adapter once at module scope (it is inert until PrivyAdapterProvider
// mounts). Guarded so a missing app id renders the setup screen instead.
const privy = PRIVY_APP_ID
  ? createPrivyAdapter({ appId: PRIVY_APP_ID, loginMethods: ['email', 'google', 'github'], debug: true })
  : null;

// Local config override so the Privy login button renders without a backend
// `/applications/config` round-trip. `embeddedWallets: true` is what surfaces it.
// The accent is spelled out rather than left to default so this file also shows
// where an integrator swaps in their own brand color.
const appConfig: ChettaPayConfig = {
  application: { name: 'Privy Adapter Example', network: STELLAR_NETWORK, chains: ['STELLAR'] },
  styles: { theme: 'light', accentColor: CHETTA.amber, embeddedWallets: true },
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

  return (
    <main className="shell">
      <Brand />
      <div className="card">
        <h1>Privy adapter</h1>
        {isAuthenticated && wallet ? (
          <>
            <div className="chip">
              {wallet.custody} &middot; {verified ? 'verified' : 'optimistic'}
            </div>
            <p>The session below is bound to a DPoP keypair this browser holds; the address is the Privy embedded wallet.</p>
            <pre className="address mono">{wallet.address}</pre>
            <button className="btn" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <p>Log in, choose Privy, and complete the email, Google or GitHub flow to provision an embedded Stellar wallet.</p>
            <button className="btn" onClick={openLoginModal}>
              Log in
            </button>
          </>
        )}
      </div>
      <p className="footnote">Signing on Stellar {STELLAR_NETWORK}.</p>
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
          Copy <code>.env.example</code> to <code>.env.local</code> and set both values:
        </p>
        <ul className="checklist">
          <li>
            <code>VITE_PRIVY_APP_ID</code>
            {PRIVY_APP_ID ? <span className="ok">&#10003;</span> : <span className="missing">missing</span>}
          </li>
          <li>
            <code>VITE_CHETTAPAY_API_KEY</code>
            {CHETTAPAY_API_KEY ? <span className="ok">&#10003;</span> : <span className="missing">missing</span>}
          </li>
        </ul>
        <p>
          Then restart <code>npm run dev</code>. The README covers the Privy dashboard prerequisites.
        </p>
      </div>
    </main>
  );
}

export function App() {
  if (!privy || !CHETTAPAY_API_KEY) {
    return <Setup />;
  }
  return (
    <PrivyAdapterProvider adapter={privy}>
      <ChettaPayProvider
        client={{
          apiKey: CHETTAPAY_API_KEY,
          walletAdapters: [privy],
          stellarNetwork: STELLAR_NETWORK,
          ...(CHETTAPAY_BASE_URL ? { baseUrl: CHETTAPAY_BASE_URL } : {}),
        }}
        appConfig={appConfig}
      >
        <Home />
      </ChettaPayProvider>
    </PrivyAdapterProvider>
  );
}
