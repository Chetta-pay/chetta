'use client';

import {
  isChettaPayClient,
  BuildOutcome,
  EnabledAssetsState,
  isInteractiveAuthAdapter,
  NetworkState,
  OnStorageDegrade,
  ChettaPayAdapters,
  ChettaPayClient,
  ChettaPayClientConfig,
  ChettaPayLoginOptions,
  ChettaPayPersistedSession,
  SendPaymentParams,
  SessionsState,
  SignOutcome,
  StellarNetwork,
  SubmitOutcome,
  SwapQuote,
  SwapQuoteParams,
  SwapToken,
  SwapVenue,
  EarnProviderId,
  EarnOpportunity,
  EarnPosition,
  EarnPositionParams,
  EarnTxParams,
  TrustlineOutcome,
  TransactionState,
  TxBuildBody,
  TxHistoryState,
  WalletBalanceState,
  WalletInfo,
} from '@chettapay/core';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ModalErrorBoundary, setModalErrorLogger } from './components/commons';
import { DistributionRulesModal } from './components/distribution-rules-modal/DistributionRulesModal';
import { EnabledAssetsModal } from './components/enabled-assets-modal/EnabledAssetsModal';
import { KycModal } from './components/kyc-modal/KycModal';
import { LoginModal } from './components/login-modal/LoginModal';
import { RampWidget } from './components/ramp-widget/RampWidget';
import { ReceiveModal } from './components/receive-modal/ReceiveModal';
import { SendModal } from './components/send-modal/SendModal';
import { SwapModal } from './components/swap-modal/SwapModal';
import { EarnModal } from './components/earn-modal/EarnModal';
import { SessionsModal } from './components/sessions-modal/SessionsModal';
import { TransactionModal } from './components/transaction-modal/TransactionModal';
import { TxHistoryModal } from './components/tx-history-modal/TxHistoryModal';
import { WalletBalanceModal } from './components/wallet-balance-modal/WalletBalanceModal';
import { browserPasskeyCeremony, browserPasskeySigner } from './lib/passkey-ceremony';
import type { ChettaPayConfig, ChettaPayStyles } from './types';

const DEFAULT_APP_CONFIG: ChettaPayConfig = {
  application: { name: '', network: 'testnet', chains: [] },
  styles: {},
};

/**
 * Compares the fields of a persisted session that actually drive UI re-renders.
 * Replaces a per-listener `JSON.stringify(...) !== JSON.stringify(...)` call -
 * cheaper, allocation-free, and explicit about what counts as "changed".
 *
 * If a field is added to `ChettaPayPersistedSession` that consumers read through
 * context, list it here too.
 */
function sessionsEqual(a: ChettaPayPersistedSession | null, b: ChettaPayPersistedSession | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.clientSessionId === b.clientSessionId &&
    a.userId === b.userId &&
    a.status === b.status &&
    a.token?.accessToken === b.token?.accessToken &&
    a.token?.refreshToken === b.token?.refreshToken &&
    a.token?.expiresAt === b.token?.expiresAt &&
    a.wallet?.address === b.wallet?.address
  );
}

interface ChettaPayContextValue {
  /**
   * The authenticated user's wallet as a discriminated union over `custody`
   * (`internal` | `smart` | `external`), or `null` when unauthenticated. Every
   * field is meaningful for any login method - `custody` is always present and
   * strictly determines the shape of `provider`. Use `wallet.address` for the
   * on-chain address and `wallet.provider` for the wallet/login provider.
   */
  wallet: WalletInfo | null;
  /**
   * Every wallet the user holds, one per chain - a superset of {@link wallet},
   * with `chain` populated. `[]` when unauthenticated. Drives the network
   * selector in the Send / Wallet Balance / Assets modals: each entry is a
   * network the user can switch to, and the first one is the default.
   */
  wallets: WalletInfo[];
  getClient: () => ChettaPayClient;
  openLoginModal: () => void;

  isAuthenticated: boolean;
  /**
   * `true` once the server has confirmed the session (login / refresh /
   * `/auth/session/resume`). `false` while a cold-start session is still
   * optimistic - gate sensitive actions (e.g. signing) on this.
   */
  verified: boolean;
  login: (options: ChettaPayLoginOptions) => void;
  logout: () => void;
  // sessions
  sessions: SessionsState;
  /** Open the active-sessions modal. */
  openSessionsModal: () => void;
  appConfig: ChettaPayConfig;
  styles: ChettaPayStyles;
  /** Remote app-config load state. 'loading' while the initial fetch is in
   *  flight, 'error' if it failed (styles fall back to empty defaults), 'ready'
   *  once resolved - or immediately 'ready' when `appConfig` is passed as a prop.
   *  The login modal shows a spinner/retry instead of an empty shell until this
   *  is 'ready'. */
  configStatus: 'loading' | 'ready' | 'error';
  /** Re-run the remote app-config fetch after an error. No-op when `appConfig`
   *  was supplied as a prop. */
  retryConfig: () => void;
  // transactions
  openTxModal: () => void;
  tx: TransactionState;
  buildTx: (
    operation: TxBuildBody['operation'],
    params: TxBuildBody['params'],
    options?: TxBuildBody['options'],
  ) => Promise<BuildOutcome>;
  signAndSubmitTx: (unsignedXdr?: string) => Promise<SubmitOutcome>;
  /** Sign only. Embedded sessions sign server-side, external sessions through their adapter. Smart wallets use `signAndSubmitTx`. */
  signTx: (unsignedXdr: string) => Promise<SignOutcome>;
  submitTx: (signedXdr: string) => Promise<SubmitOutcome>;
  /** One-shot: build -> sign -> submit. Drives the same TransactionState flow as the split calls. */
  buildAndSignAndSubmitTx: (
    operation: TxBuildBody['operation'],
    params: TxBuildBody['params'],
    options?: TxBuildBody['options'],
  ) => Promise<SubmitOutcome>;
  /** Alias of `buildAndSignAndSubmitTx`. */
  runTx: (
    operation: TxBuildBody['operation'],
    params: TxBuildBody['params'],
    options?: TxBuildBody['options'],
  ) => Promise<SubmitOutcome>;
  /**
   * Send a payment on any chain the user holds a wallet on. Stellar keeps the
   * split flow (so external adapters and passkeys still work); a chain whose
   * signature expires goes through one server-side call and is embedded-only.
   */
  sendPayment: (params: SendPaymentParams) => Promise<SubmitOutcome>;
  // network
  network: StellarNetwork;
  setNetwork: (network: StellarNetwork) => void;
  // wallet balance
  walletBalance: WalletBalanceState;
  refreshWalletBalance: () => Promise<void>;
  // enabled assets
  /**
   * The application's dashboard-enabled assets paired with the authenticated
   * wallet's on-chain trustline state (`trustlineEstablished` per asset). Driven
   * by {@link refreshAssets}; mirrors {@link walletBalance}.
   */
  enabledAssets: EnabledAssetsState;
  refreshAssets: () => Promise<void>;
  /**
   * Establishes (omit `limit`) or removes (`limit: '0'`) a trustline for an
   * asset. Sponsorship is derived automatically from the app's dashboard config
   * (the app covers the reserve + fee when eligible); pass `skipSponsorship` to
   * force the user's own wallet to pay. Mirrors {@link ChettaPayClient.setTrustline}.
   */
  setTrustline: (
    asset: { code: string; issuer: string },
    opts?: {
      limit?: string;
      /** Force self-pay even when the app would sponsor the trustline. */
      skipSponsorship?: boolean;
    },
  ) => Promise<TrustlineOutcome>;
  /** Open the enabled-assets / trustline-state modal. */
  openEnabledAssetsModal: () => void;
  // kyc
  openKycModal: (options?: {
    country?: string;
    level?: 'basic' | 'intermediate' | 'enhanced';
    onApproved?: () => void;
  }) => void;
  // ramps
  openRampModal: () => void;
  // tx history
  txHistory: TxHistoryState;
  openTxHistoryModal: () => void;
  // wallet balance modal
  openWalletBalanceModal: () => void;
  // send / receive
  openSendModal: () => void;
  openReceiveModal: () => void;
  // swap (DEX/AMM)
  /**
   * The swap venues this app exposes to end-users (empty = swap disabled, hide
   * swap UI). Mirrors {@link ChettaPayClient.getSwapConfig}.
   */
  getSwapConfig: () => Promise<SwapVenue[]>;
  /**
   * The curated "buy" tokens this app opted into (admin catalog). Mirrors
   * {@link ChettaPayClient.getSwapTokens}.
   */
  getSwapTokens: () => Promise<SwapToken[]>;
  /**
   * Quote an asset-to-asset swap across the requested venue(s). Read-only;
   * returns quotes ranked best-first. Mirrors {@link ChettaPayClient.getSwapQuote}.
   */
  getSwapQuote: (params: SwapQuoteParams) => Promise<SwapQuote[]>;
  /**
   * Execute a swap from a quote (establishes the buy-asset trustline first when
   * needed). Drives the transaction state machine. Mirrors {@link ChettaPayClient.swap}.
   */
  swap: (quote: SwapQuote, opts?: { autoTrustline?: boolean }) => Promise<SubmitOutcome>;
  /** Open the swap modal. */
  openSwapModal: () => void;
  // earn (yield vaults / lending)
  /**
   * The yield providers this app exposes to end-users (empty = Earn disabled,
   * hide Earn UI). Mirrors {@link ChettaPayClient.getEarnProviders}.
   */
  getEarnProviders: () => Promise<EarnProviderId[]>;
  /**
   * The vaults (DeFindex) or pools (Blend) a provider exposes, with live APY.
   * Mirrors {@link ChettaPayClient.getEarnOpportunities}.
   */
  getEarnOpportunities: (provider: EarnProviderId) => Promise<EarnOpportunity[]>;
  /**
   * The connected wallet's position (balance + APY) in a vault/pool. Read-only.
   * Mirrors {@link ChettaPayClient.getEarnPosition}.
   */
  getEarnPosition: (params: EarnPositionParams) => Promise<EarnPosition>;
  /**
   * Deposit into a vault/pool (asset amount). Drives the transaction state
   * machine. Mirrors {@link ChettaPayClient.earnDeposit}.
   */
  earnDeposit: (params: EarnTxParams) => Promise<SubmitOutcome>;
  /**
   * Withdraw from a vault/pool (amount in the position `withdrawUnit`). Mirrors
   * {@link ChettaPayClient.earnWithdraw}.
   */
  earnWithdraw: (params: EarnTxParams) => Promise<SubmitOutcome>;
  /** Open the Earn modal. */
  openEarnModal: () => void;
  // distribution
  openDistributionRulesModal: () => void;
  // adapters
  adapters?: ChettaPayAdapters;
}

const ChettaPayContext = createContext<ChettaPayContextValue | null>(null);

interface ChettaPayProviderProps {
  /**
   * Either a pre-built `ChettaPayClient` instance (useful for testing or for
   * reusing the same client outside React) or a `ChettaPayClientConfig` that the
   * provider will use to construct one on mount.
   *
   * The client is locked at first render: changing this prop afterwards is
   * ignored. To swap clients, unmount and remount the provider.
   *
   * Either form gets the web passkey ceremony installed (a pre-built instance
   * is filled in via `setPasskeyDefaults`), so the "Smart Wallet" login works
   * without the consumer wiring WebAuthn. A ceremony you configured yourself is
   * always kept.
   */
  client: ChettaPayClient | ChettaPayClientConfig;
  /**
   * Local REPLACEMENT for the `/applications/config` response, not a patch over
   * it. Passing anything at all skips the remote fetch entirely; what you pass
   * is used verbatim and is never merged with the server's answer, so there is
   * no "fill in the fields I left out".
   *
   * `styles` may be partial (every field in it is optional), but `application`
   * may not: `name`, `network` and `chains` are all required by the type. If you
   * bypass the type anyway (plain JS, or a cast), each missing field lands on a
   * default scattered across the components rather than on anything central:
   *
   *   chains       absent -> the chain order/filter falls back to the order the
   *                         session listed the user's wallets in (see useChains)
   *   name         absent -> 'ChettaPay'
   *   theme        absent -> 'light'
   *   accentColor  absent -> Chetta amber (sable theme: gold)
   *   emailEnabled, providers, embeddedWallets, smartWallet
   *                absent -> false. NOTE: that means EVERY login method is off
   *                         and the login modal renders with no way in.
   *
   * Leave this `undefined` to have the SDK fetch `/applications/config` on
   * mount, which is also what keeps branding, login methods and chains current:
   * that fetch re-runs on every mount, so dashboard changes land on the next
   * page load. Supplying this prop opts out of that too.
   */
  appConfig?: ChettaPayConfig;
  adapters?: ChettaPayAdapters;
  /**
   * Notified when persistent storage silently degrades to in-memory mode
   * (Safari private browsing quota errors, sandboxed iframes, etc.). Use this
   * to surface a UI hint that the session won't survive a reload, log to
   * telemetry, or fall back to a different storage strategy.
   *
   * Fires at most once per provider lifetime; late mounts get the latched
   * state replayed on subscribe.
   */
  onStorageDegrade?: OnStorageDegrade;
  children: ReactNode;
}

/**
 * Clients built from a `ChettaPayClientConfig`, keyed by that exact config object.
 *
 * React StrictMode double-invokes the `useState` initializer below on mount and
 * discards the FIRST pass's hook state entirely - the value the component keeps
 * comes from the second pass, and `useRef` carries nothing between the two. So
 * a ref guard cannot see the first construction, and without this map the
 * provider built TWO clients and only ever tore down the one React kept. The
 * orphan outlived the provider, holding a cross-tab `storage` listener, a
 * refresh loop and a live-client registry entry for the life of the page - and
 * two live clients on one API key share a session row and a DPoP keypair, which
 * is exactly the configuration `@chettapay/core`'s session teardown has to defend
 * against. (See `tests/smoke-react.cjs`, which renders through jsdom because
 * `react-test-renderer` does not reproduce the double render at all.)
 *
 * Both passes receive the same props object - React re-invokes a component's
 * render function in place and reconciles children from the last pass - so
 * keying on the config makes the second pass reuse the first pass's client
 * instead of building another. Weak, so an abandoned config never keeps a
 * client alive; and the entry is dropped as soon as the mount effect claims the
 * client, so a later provider rendered with the same (retained) config object
 * builds its own rather than receiving one this provider is about to destroy.
 *
 * Two providers sharing one config OBJECT still share the client. That is the
 * better outcome of the two - one client per config identity, rather than two
 * fighting over the same session row - and it matches what the SDK already
 * warns about for multiple clients on one API key.
 */
const clientByConfig = new WeakMap<ChettaPayClientConfig, ChettaPayClient>();

export function ChettaPayProvider({
  client,
  appConfig: appConfigProp,
  adapters,
  onStorageDegrade,
  children,
}: ChettaPayProviderProps) {
  // Inject the browser passkey ceremony so `loginSmartWallet()` /
  // `createSmartWallet()` work out of the box on web, whichever way the client
  // arrives: built here from a config, or handed over ready-made (a consumer
  // singleton shared with non-React code). The consumer can override it (e.g. a
  // React Native native provider) via `client.passkey`; `??` keeps an explicit
  // ceremony winning while an absent/undefined one still gets the default.
  const [chettaPayClient] = useState<ChettaPayClient>(() => {
    if (isChettaPayClient(client)) {
      client.setPasskeyDefaults({ passkey: browserPasskeyCeremony, passkeySign: browserPasskeySigner });
      return client;
    }
    // Reuse the instance a discarded render pass already built (see
    // `clientByConfig`) instead of constructing a second one that nothing
    // would ever tear down.
    const alreadyBuilt = clientByConfig.get(client);
    if (alreadyBuilt) return alreadyBuilt;
    const built = new ChettaPayClient({
      ...client,
      passkey: client.passkey ?? browserPasskeyCeremony,
      passkeySign: client.passkeySign ?? browserPasskeySigner,
    });
    clientByConfig.set(client, built);
    return built;
  });
  // Only a client WE constructed is ours to tear down on unmount; a client the
  // consumer passed in is theirs to manage. Captured once (the useState
  // initializer above made the same decision).
  const ownsClientRef = useRef(!isChettaPayClient(client));
  const destroyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** The config this provider built from, until the mount effect claims it. */
  const builtFromConfigRef = useRef<ChettaPayClientConfig | null>(isChettaPayClient(client) ? null : client);

  // Tear down the client on a real unmount so its cross-tab storage listener,
  // refresh timer, and live-client registry entry don't leak - matters when the
  // provider is keyed (e.g. `key={apiKey}`) and remounts on network change.
  useEffect(() => {
    if (!ownsClientRef.current) return;
    // Claim the client. Effects run after the double render, so the shared
    // entry has done its job; dropping it keeps a future provider from being
    // handed a client this one will destroy on unmount.
    if (builtFromConfigRef.current) {
      clientByConfig.delete(builtFromConfigRef.current);
      builtFromConfigRef.current = null;
    }
    // This mount is live again - cancel any teardown scheduled by a prior
    // (StrictMode dev) unmount before it can destroy the client we still use.
    if (destroyTimerRef.current) {
      clearTimeout(destroyTimerRef.current);
      destroyTimerRef.current = null;
    }
    return () => {
      // Defer to a macrotask: React StrictMode unmounts then synchronously
      // remounts in dev, and the remount's effect (above) cancels this before it
      // runs. On a real unmount nothing re-mounts to cancel it, so it fires.
      destroyTimerRef.current = setTimeout(() => chettaPayClient.destroy(), 0);
    };
  }, [chettaPayClient]);
  const [networkState, setNetworkState] = useState<NetworkState>(() => chettaPayClient.getNetworkState());
  const [sessionState, setSessionState] = useState<ChettaPayPersistedSession | null>(null);
  // `true` once the server has confirmed the restored session (via login,
  // refresh, or `/auth/session/resume`). Use it to gate sensitive actions
  // while a cold-start session is still optimistic.
  const [verified, setVerified] = useState(false);
  const [transaction, setTransaction] = useState<TransactionState>({ step: 'idle' });
  const [txHistory, setTxHistory] = useState<TxHistoryState>({ step: 'idle' });
  const [sessions, setSessions] = useState<SessionsState>({ step: 'idle' });
  const [walletBalance, setWalletBalance] = useState<WalletBalanceState>({ step: 'idle' });
  const [enabledAssets, setEnabledAssets] = useState<EnabledAssetsState>({ step: 'idle' });
  const [resolvedConfig, setResolvedConfig] = useState<ChettaPayConfig>(() => appConfigProp ?? DEFAULT_APP_CONFIG);
  const [configStatus, setConfigStatus] = useState<'loading' | 'ready' | 'error'>(
    appConfigProp !== undefined ? 'ready' : 'loading',
  );
  const [configRetry, setConfigRetry] = useState(0);
  const retryConfig = useCallback(() => setConfigRetry((n) => n + 1), []);

  // A locally-passed `appConfig` is tracked by CONTENT, not by identity. A
  // consumer writing `appConfig={{ ... }}` inline hands us a new object on every
  // render, so keying the config effect on the object itself would re-run it,
  // set state with a fresh reference, re-render, and never settle. The
  // serialized form only changes when the config really changes, and
  // `ChettaPayConfig` is a plain JSON response shape, so it serializes losslessly.
  const appConfigKey = appConfigProp === undefined ? '' : JSON.stringify(appConfigProp);
  // The effect reads the prop through this ref so it does not have to key on it.
  const appConfigPropRef = useRef(appConfigProp);
  appConfigPropRef.current = appConfigProp;

  useEffect(() => {
    return chettaPayClient.onTransactionStateChange(setTransaction);
  }, [chettaPayClient]);

  useEffect(() => {
    return chettaPayClient.onTxHistoryStateChange(setTxHistory);
  }, [chettaPayClient]);

  useEffect(() => {
    return chettaPayClient.onSessionsStateChange(setSessions);
  }, [chettaPayClient]);

  useEffect(() => {
    return chettaPayClient.onWalletBalanceStateChange(setWalletBalance);
  }, [chettaPayClient]);

  useEffect(() => {
    return chettaPayClient.onEnabledAssetsStateChange(setEnabledAssets);
  }, [chettaPayClient]);

  useEffect(() => {
    return chettaPayClient.onNetworkStateChange((state) => {
      setNetworkState(state);
    });
  }, [chettaPayClient]);

  useEffect(() => {
    if (!onStorageDegrade) return;
    return chettaPayClient.onStorageDegrade(onStorageDegrade);
  }, [chettaPayClient, onStorageDegrade]);

  useEffect(() => {
    return chettaPayClient.onAuthStateChange((authState) => {
      if (authState.step === 'authenticated') {
        setSessionState((prev) => (sessionsEqual(prev, authState.session) ? prev : authState.session));
        // The session object is identical between the optimistic restore and
        // the post-resume confirmation, so `verified` is tracked separately -
        // otherwise the sessionsEqual short-circuit would swallow the flip.
        setVerified(authState.verified);
      } else if (authState.step === 'idle') {
        setSessionState(null);
        setVerified(false);
      }
    });
  }, [chettaPayClient]);

  // Auto-login for interactive adapters (e.g. Privy). When the adapter's
  // provider authenticates *outside* the sub-modal flow - after an OAuth redirect
  // (the page reloaded, so the sub-modal promise is gone) or a persisted provider
  // session on load - and ChettaPay has no session yet, trigger `login({ provider })`
  // so `connect()` + SEP-10 run. Read the session through a ref so the
  // subscription is set up once and never re-subscribes on session changes.
  const sessionRef = useRef(sessionState);
  sessionRef.current = sessionState;
  useEffect(() => {
    const unsubscribes: Array<() => void> = [];
    for (const { id } of chettaPayClient.listWalletAdapters()) {
      const adapter = chettaPayClient.getWalletAdapter(id);
      if (!isInteractiveAuthAdapter(adapter) || !adapter.onProviderAuthChange) continue;
      let triggered = false;
      unsubscribes.push(
        adapter.onProviderAuthChange((state) => {
          // Reset on sign-out so a later re-auth can trigger again (rising edge).
          if (!state.authenticated || !state.address) {
            triggered = false;
            return;
          }
          if (triggered || sessionRef.current?.wallet?.address) return;
          triggered = true;
          chettaPayClient.login({ provider: id } as ChettaPayLoginOptions);
        }),
      );
    }
    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
    };
  }, [chettaPayClient]);

  // Route the modal error boundary's logs through the client's level-gated
  // logger (it's a class component that can't read context directly).
  useEffect(() => {
    setModalErrorLogger(chettaPayClient.getLogger());
  }, [chettaPayClient]);

  useEffect(() => {
    // PRESENCE of `appConfig` is the opt-out, not its contents: any value at all
    // means the consumer owns the config, so the remote fetch never runs and
    // what they passed is used as-is. It is 'ready' immediately because there is
    // nothing to wait for. It is also re-applied here, not only seeded in the
    // initial state, so a consumer that swaps the config after mount is not left
    // with the value from the first render.
    //
    // Otherwise this runs on every mount, which is what keeps branding, login
    // methods and chains current: a change in the dashboard lands on the next
    // page load with no re-login.
    const localConfig = appConfigPropRef.current;
    if (localConfig !== undefined) {
      // Same fallback as the initial state above, so a JS consumer passing an
      // explicit null still lands on the default config instead of a null one.
      setResolvedConfig(localConfig ?? DEFAULT_APP_CONFIG);
      setConfigStatus('ready');
      return;
    }
    let cancelled = false;
    setConfigStatus('loading');
    chettaPayClient
      .getAppConfig()
      .then((fetched) => {
        if (cancelled) return;
        if (!fetched) {
          setConfigStatus('error');
          return;
        }
        setResolvedConfig(fetched as ChettaPayConfig);
        setConfigStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        chettaPayClient.getLogger().error('[ChettaPayProvider] getAppConfig failed', err);
        setConfigStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [chettaPayClient, appConfigKey, configRetry]);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycModalOptions, setKycModalOptions] = useState<{
    country?: string;
    level?: 'basic' | 'intermediate' | 'enhanced';
    onApproved?: () => void;
  }>({});
  const [rampModalOpen, setRampModalOpen] = useState(false);
  const [txHistoryModalOpen, setTxHistoryModalOpen] = useState(false);
  const [walletBalanceModalOpen, setWalletBalanceModalOpen] = useState(false);
  const [enabledAssetsModalOpen, setEnabledAssetsModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [earnModalOpen, setEarnModalOpen] = useState(false);
  // Bumped every time a tx-driving modal opens, used as its `key` so a re-open
  // remounts it (local `step` back to the form) even when it was already open on
  // a terminal "Done!"/error screen. Paired with `resetTransactionState()`.
  const [sendModalKey, setSendModalKey] = useState(0);
  const [swapModalKey, setSwapModalKey] = useState(0);
  const [earnModalKey, setEarnModalKey] = useState(0);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [distributionRulesModalOpen, setDistributionRulesModalOpen] = useState(false);

  // PII (incl. providers.wallet.address) lives on `client.getUserProfile()`, not on the
  // persisted session. For every wallet type, `wallet.address` holds the on-chain
  // address we care about.
  const walletAddress = sessionState?.wallet?.address || '';
  const getClient = useCallback(() => chettaPayClient, [chettaPayClient]);
  // refreshBalance resolves the own wallet server-side from the session;
  // walletAddress stays in deps so the callback re-binds when the wallet changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- walletAddress is an intentional re-bind trigger, not read in the body
  const refreshWalletBalance = useCallback(() => chettaPayClient.refreshBalance(), [chettaPayClient, walletAddress]);
  // refreshAssets resolves the own wallet server-side from the session;
  // walletAddress stays in deps so the callback re-binds when the wallet changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- walletAddress is an intentional re-bind trigger, not read in the body
  const refreshAssets = useCallback(() => chettaPayClient.refreshAssets(), [chettaPayClient, walletAddress]);

  const contextValue: ChettaPayContextValue = useMemo(() => {
    const styles: ChettaPayStyles = resolvedConfig.styles ?? {};
    return {
      // session
      wallet: chettaPayClient.getWallet(),
      wallets: chettaPayClient.getWallets(),
      isAuthenticated: !!walletAddress,
      verified,
      // client
      getClient,
      // auth
      login: (options: ChettaPayLoginOptions) => chettaPayClient.login(options),
      logout: () => chettaPayClient.logout(),
      openLoginModal: () => setLoginModalOpen(true),
      // transactions
      tx: transaction,
      buildTx: (operation, params, options) => chettaPayClient.buildTx(operation, params, options),
      signAndSubmitTx: (unsignedXdr?: string) => chettaPayClient.signAndSubmitTx(unsignedXdr),
      signTx: (unsignedXdr: string) => chettaPayClient.signTx(unsignedXdr),
      submitTx: (signedXdr: string) => chettaPayClient.submitTx(signedXdr),
      buildAndSignAndSubmitTx: (operation, params, options) =>
        chettaPayClient.buildAndSignAndSubmitTx(operation, params, options),
      runTx: (operation, params, options) => chettaPayClient.runTx(operation, params, options),
      sendPayment: (params) => chettaPayClient.sendPayment(params),
      openTxModal: () => setTransactionModalOpen(true),
      // tx history
      txHistory,
      openTxHistoryModal: () => setTxHistoryModalOpen(true),
      // wallet balance
      walletBalance,
      refreshWalletBalance,
      openWalletBalanceModal: () => setWalletBalanceModalOpen(true),
      // enabled assets
      enabledAssets,
      refreshAssets,
      setTrustline: (asset, opts) => chettaPayClient.setTrustline(asset, opts),
      openEnabledAssetsModal: () => setEnabledAssetsModalOpen(true),
      // send / receive
      openSendModal: () => {
        chettaPayClient.resetTransactionState();
        setSendModalKey((k) => k + 1);
        setSendModalOpen(true);
      },
      openReceiveModal: () => setReceiveModalOpen(true),
      // swap
      getSwapConfig: () => chettaPayClient.getSwapConfig(),
      getSwapTokens: () => chettaPayClient.getSwapTokens(),
      getSwapQuote: (params) => chettaPayClient.getSwapQuote(params),
      swap: (quote, opts) => chettaPayClient.swap(quote, opts),
      openSwapModal: () => {
        chettaPayClient.resetTransactionState();
        setSwapModalKey((k) => k + 1);
        setSwapModalOpen(true);
      },
      // earn
      getEarnProviders: () => chettaPayClient.getEarnProviders(),
      getEarnOpportunities: (provider) => chettaPayClient.getEarnOpportunities(provider),
      getEarnPosition: (params) => chettaPayClient.getEarnPosition(params),
      earnDeposit: (params) => chettaPayClient.earnDeposit(params),
      earnWithdraw: (params) => chettaPayClient.earnWithdraw(params),
      openEarnModal: () => {
        chettaPayClient.resetTransactionState();
        setEarnModalKey((k) => k + 1);
        setEarnModalOpen(true);
      },
      // sessions
      sessions,
      openSessionsModal: () => setSessionsModalOpen(true),
      // distribution
      openDistributionRulesModal: () => setDistributionRulesModalOpen(true),
      // network
      network: networkState.step === 'connected' ? networkState.network : 'testnet',
      setNetwork: (network: StellarNetwork) => chettaPayClient.setNetwork(network),
      // kyc
      openKycModal: (options = {}) => {
        setKycModalOptions(options);
        setKycModalOpen(true);
      },
      // ramp
      openRampModal: () => setRampModalOpen(true),
      // config
      appConfig: resolvedConfig,
      styles,
      configStatus,
      retryConfig,
      adapters,
    } as ChettaPayContextValue;
  }, [
    walletAddress,
    verified,
    chettaPayClient,
    getClient,
    transaction,
    txHistory,
    sessions,
    walletBalance,
    refreshWalletBalance,
    enabledAssets,
    refreshAssets,
    networkState,
    resolvedConfig,
    configStatus,
    retryConfig,
    adapters,
  ]);

  return (
    <ChettaPayContext.Provider value={contextValue}>
      {children}
      {loginModalOpen && (
        <ModalErrorBoundary onClose={() => setLoginModalOpen(false)}>
          <LoginModal onClose={() => setLoginModalOpen(false)} />
        </ModalErrorBoundary>
      )}
      {transactionModalOpen && (
        <ModalErrorBoundary onClose={() => setTransactionModalOpen(false)}>
          <TransactionModal onClose={() => setTransactionModalOpen(false)} />
        </ModalErrorBoundary>
      )}
      {kycModalOpen && (
        <ModalErrorBoundary onClose={() => setKycModalOpen(false)}>
          <KycModal
            onClose={() => setKycModalOpen(false)}
            {...(kycModalOptions.country !== undefined && { country: kycModalOptions.country })}
            {...(kycModalOptions.level !== undefined && { level: kycModalOptions.level })}
            {...(kycModalOptions.onApproved !== undefined && { onApproved: kycModalOptions.onApproved })}
          />
        </ModalErrorBoundary>
      )}
      {rampModalOpen && (
        <ModalErrorBoundary onClose={() => setRampModalOpen(false)}>
          <RampWidget onClose={() => setRampModalOpen(false)} />
        </ModalErrorBoundary>
      )}
      {txHistoryModalOpen && (
        <ModalErrorBoundary onClose={() => setTxHistoryModalOpen(false)}>
          <TxHistoryModal onClose={() => setTxHistoryModalOpen(false)} />
        </ModalErrorBoundary>
      )}
      {walletBalanceModalOpen && (
        <ModalErrorBoundary onClose={() => setWalletBalanceModalOpen(false)}>
          <WalletBalanceModal onClose={() => setWalletBalanceModalOpen(false)} />
        </ModalErrorBoundary>
      )}
      {enabledAssetsModalOpen && (
        <ModalErrorBoundary onClose={() => setEnabledAssetsModalOpen(false)}>
          <EnabledAssetsModal onClose={() => setEnabledAssetsModalOpen(false)} />
        </ModalErrorBoundary>
      )}
      {sendModalOpen && (
        <ModalErrorBoundary key={sendModalKey} onClose={() => setSendModalOpen(false)}>
          <SendModal onClose={() => setSendModalOpen(false)} />
        </ModalErrorBoundary>
      )}
      {swapModalOpen && (
        <ModalErrorBoundary key={swapModalKey} onClose={() => setSwapModalOpen(false)}>
          <SwapModal onClose={() => setSwapModalOpen(false)} />
        </ModalErrorBoundary>
      )}
      {earnModalOpen && (
        <ModalErrorBoundary key={earnModalKey} onClose={() => setEarnModalOpen(false)}>
          <EarnModal onClose={() => setEarnModalOpen(false)} />
        </ModalErrorBoundary>
      )}
      {receiveModalOpen && (
        <ModalErrorBoundary onClose={() => setReceiveModalOpen(false)}>
          <ReceiveModal onClose={() => setReceiveModalOpen(false)} />
        </ModalErrorBoundary>
      )}
      {sessionsModalOpen && (
        <ModalErrorBoundary onClose={() => setSessionsModalOpen(false)}>
          <SessionsModal onClose={() => setSessionsModalOpen(false)} />
        </ModalErrorBoundary>
      )}
      {distributionRulesModalOpen && (
        <ModalErrorBoundary onClose={() => setDistributionRulesModalOpen(false)}>
          <DistributionRulesModal onClose={() => setDistributionRulesModalOpen(false)} />
        </ModalErrorBoundary>
      )}
    </ChettaPayContext.Provider>
  );
}

export function useChettaPay() {
  const ctx = useContext(ChettaPayContext);
  if (!ctx) {
    throw new Error('useChettaPay must be used inside <ChettaPayProvider>');
  }
  return ctx;
}
