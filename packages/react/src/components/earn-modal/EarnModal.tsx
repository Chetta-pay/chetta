'use client';

import { EarnOpportunity, EarnPosition, EarnProviderId } from '@chettapay/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChettaPay } from '../../context';
import { ChettaPayModalFooter } from '../commons';
import { buildModalCssVars, modalChrome } from '../modal-theme';
import { TxStatusView } from '../transaction-modal/TxStatusView';
import '../shared.css';
import '../transaction-modal/TransactionModal.css';
import '../send-modal/SendModal.css';
import '../swap-modal/SwapModal.css';
import './EarnModal.css';

interface EarnModalProps {
  onClose: () => void;
}

/** Poll interval (ms) for the live position + APY. */
const POSITION_POLL_MS = 10000;

const PROVIDER_LABELS: Record<EarnProviderId, string> = {
  blend: 'Blend',
  defindex: 'DeFindex',
};

const IN_FLIGHT_STEPS = [
  'building',
  'signing',
  'submitting',
  'submitted',
  'signing-submitting',
  'building-signing-submitting',
] as const;

function formatAmount(value: string): string {
  const n = parseFloat(value);
  return isNaN(n) ? value : n.toLocaleString(undefined, { maximumFractionDigits: 7 });
}

export function EarnModal({ onClose }: EarnModalProps) {
  const {
    getEarnProviders,
    getEarnOpportunities,
    getEarnPosition,
    earnDeposit,
    earnWithdraw,
    tx: transaction,
    wallet,
    walletBalance,
    refreshWalletBalance,
    enabledAssets,
    refreshAssets,
    setTrustline,
    network,
    styles,
  } = useChettaPay();

  const walletType = wallet?.custody === 'external' ? wallet.provider : null;
  const smartUnsupported = wallet?.custody === 'smart';
  const { theme, accentColor, styleOverrides, overlayStyle } = modalChrome(styles);

  const [step, setStep] = useState<'form' | 'tx'>('form');
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [providers, setProviders] = useState<EarnProviderId[] | null>(null); // null = loading
  const [provider, setProvider] = useState<EarnProviderId | null>(null);
  const [opportunities, setOpportunities] = useState<EarnOpportunity[]>([]);
  const [opportunityId, setOpportunityId] = useState('');
  const [position, setPosition] = useState<EarnPosition | null>(null);
  const [amount, setAmount] = useState('');
  const [loadingOpps, setLoadingOpps] = useState(false);
  const [formError, setFormError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showXdr, setShowXdr] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Providers ------------------------------------------------------------
  const loadProviders = useCallback(() => {
    setProviders(null);
    return getEarnProviders()
      .then((ps) => {
        setProviders(ps);
        setProvider((cur) => cur ?? ps[0] ?? null);
      })
      .catch(() => setProviders([]));
  }, [getEarnProviders]);

  useEffect(() => {
    void loadProviders();
  }, [loadProviders]);

  // The wallet balance drives the Deposit tab's "In your wallet" row + Max; the
  // enabled assets drive the deposit-asset trustline check.
  useEffect(() => {
    void refreshWalletBalance();
    void refreshAssets();
  }, [refreshWalletBalance, refreshAssets]);

  // --- Opportunities (per provider) -------------------------------------------
  useEffect(() => {
    if (!provider) return;
    let cancelled = false;
    setLoadingOpps(true);
    getEarnOpportunities(provider)
      .then((opps) => {
        if (cancelled) return;
        setOpportunities(opps);
        setOpportunityId((cur) => (opps.some((o) => o.id === cur) ? cur : (opps[0]?.id ?? '')));
      })
      .catch(() => {
        if (!cancelled) setOpportunities([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingOpps(false);
      });
    return () => {
      cancelled = true;
    };
  }, [provider, getEarnOpportunities]);

  const selectedOpportunity = opportunities.find((o) => o.id === opportunityId) ?? null;

  // --- Position (live, polled) ------------------------------------------------
  const refreshPosition = useCallback(() => {
    if (!provider || !opportunityId || !wallet) return;
    getEarnPosition({ provider, opportunity: opportunityId })
      .then(setPosition)
      .catch(() => {
        /* leave the last snapshot on a transient read error */
      });
  }, [provider, opportunityId, wallet, getEarnPosition]);

  useEffect(() => {
    setPosition(null);
    refreshPosition();
  }, [refreshPosition]);

  useEffect(() => {
    if (step !== 'form' || !provider || !opportunityId) return;
    const id = setInterval(refreshPosition, POSITION_POLL_MS);
    return () => clearInterval(id);
  }, [step, provider, opportunityId, refreshPosition]);

  useEffect(
    () => () => {
      if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
    },
    [],
  );

  // --- Derived ----------------------------------------------------------------
  const providersLoading = providers === null;
  const earnUnavailable = providers !== null && providers.length === 0;
  const withdrawUnit = position?.withdrawUnit ?? 'asset';
  const assetCode = selectedOpportunity?.asset.code ?? '';
  const amountUnitLabel = tab === 'deposit' ? assetCode : withdrawUnit === 'shares' ? 'shares' : assetCode;

  // The wallet's spendable balance of the selected opportunity's asset (native
  // XLM matches by type; issued assets by code + issuer). `null` = unknown yet.
  const walletAvailable = (() => {
    if (!selectedOpportunity) return null;
    const balances = walletBalance.step === 'loaded' ? walletBalance.data.balances : [];
    const issuer = selectedOpportunity.asset.issuer;
    const rec = balances.find((b) => (issuer === null ? b.type === 'native' : b.code === assetCode && b.issuer === issuer));
    return rec ? rec.available : null;
  })();

  // Depositing an issued asset (e.g. USDC) needs the wallet to trust it first.
  // Native XLM and pure Soroban tokens (no classic issuer) never do; smart
  // (C-address) wallets hold SAC tokens, so no classic trustline applies. When
  // needed, the deposit runs as two signatures: trustline, then deposit.
  const depositAssetRecord = (() => {
    if (!selectedOpportunity?.asset.issuer || enabledAssets.step !== 'loaded') return undefined;
    // Stellar-only: the catalog is multichain now, and Earn (DeFindex/Blend)
    // settles on Stellar. Chain is undefined on the v1 shape, so absent = Stellar.
    return enabledAssets.data.assets.find(
      (a) =>
        (a.chain === undefined || a.chain === 'STELLAR') &&
        a.code === assetCode &&
        a.issuer === selectedOpportunity.asset.issuer,
    );
  })();
  const depositNeedsTrustline =
    tab === 'deposit' && !smartUnsupported && !!selectedOpportunity?.asset.issuer && !depositAssetRecord?.trustlineEstablished;

  const hash = transaction.step === 'success' ? transaction.hash : null;
  const buildData = 'buildData' in transaction ? transaction.buildData : null;
  const explorerNetwork = buildData?.summary.network?.toLowerCase().includes('testnet')
    ? 'testnet'
    : buildData
      ? 'public'
      : network === 'testnet'
        ? 'testnet'
        : 'public';
  const explorerUrl = hash ? `https://stellar.expert/explorer/${explorerNetwork}/tx/${hash}` : null;

  const isInProgress = (IN_FLIGHT_STEPS as readonly string[]).includes(transaction.step);
  const showBack = step === 'tx' && (transaction.step === 'error' || transaction.step === 'success') && !isInProgress;

  const txTitle = isInProgress
    ? tab === 'deposit'
      ? 'Depositing…'
      : 'Withdrawing…'
    : transaction.step === 'success'
      ? 'Done!'
      : transaction.step === 'error'
        ? tab === 'deposit'
          ? 'Deposit failed'
          : 'Withdraw failed'
        : 'Confirm';

  // Over-spend guard: deposit can't exceed the wallet's available balance;
  // withdraw can't exceed the position. Skipped while the relevant figure is
  // still unknown (`null`) so a slow balance read doesn't block a valid amount.
  const parsedAmount = parseFloat(amount);
  const exceedsAvailable =
    tab === 'deposit'
      ? walletAvailable != null && parsedAmount > parseFloat(walletAvailable)
      : position != null && parsedAmount > parseFloat(position.withdrawable);

  const canSubmit =
    !smartUnsupported &&
    !!provider &&
    !!opportunityId &&
    !!amount &&
    parsedAmount > 0 &&
    !exceedsAvailable &&
    !providersLoading &&
    !loadingOpps;

  const cssVars = buildModalCssVars(theme, accentColor, styleOverrides);

  // --- Actions ----------------------------------------------------------------
  async function handleSubmit() {
    setFormError('');
    if (smartUnsupported) {
      setFormError('Earn is not yet supported for smart (passkey) wallets');
      return;
    }
    if (!provider || !opportunityId) {
      setFormError('Select a vault or pool');
      return;
    }
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setFormError('Enter a valid amount');
      return;
    }
    if (tab === 'deposit' && walletAvailable != null && parsed > parseFloat(walletAvailable)) {
      setFormError('Amount exceeds your wallet balance');
      return;
    }
    if (tab === 'withdraw' && position && parsed > parseFloat(position.withdrawable)) {
      setFormError('Amount exceeds your position');
      return;
    }
    setStep('tx');

    // Deposit of an issued asset needs its trustline first (native never does).
    // Establish it, then deposit - two signatures, like swap.
    if (tab === 'deposit' && depositNeedsTrustline && selectedOpportunity?.asset.issuer) {
      // Sponsorship is derived automatically from the app config now - no flag.
      const tl = await setTrustline({ code: assetCode, issuer: selectedOpportunity.asset.issuer });
      if (tl.status === 'error') {
        setFormError(`Trustline for ${assetCode} failed: ${tl.details ?? 'unknown error'}`);
        setStep('form');
        return;
      }
      await refreshAssets();
    }

    const params = { provider, opportunity: opportunityId, amount };
    const outcome = tab === 'deposit' ? await earnDeposit(params) : await earnWithdraw(params);
    if (outcome.status === 'success' || outcome.status === 'pending') {
      setAmount('');
      refreshPosition();
    }
  }

  async function handleRetry() {
    if (transaction.step !== 'error' || !provider || !opportunityId) return;
    const params = { provider, opportunity: opportunityId, amount };
    if (tab === 'deposit') await earnDeposit(params);
    else await earnWithdraw(params);
  }

  function handleCopyHash() {
    if (!hash) return;
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(true);
      if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        copyTimerRef.current = null;
        setCopied(false);
      }, 2000);
    });
  }

  function handleBack() {
    setStep('form');
    setShowXdr(false);
    setCopied(false);
    refreshPosition();
  }

  // Re-fetch everything the modal shows on demand: the opportunities for the
  // current provider (fresh APYs), the wallet's position, and the wallet balance
  // ("In your wallet" + Max). Leaves the current data in place on a transient
  // read error.
  async function handleRefresh() {
    if (refreshing || !provider) return;
    setRefreshing(true);
    try {
      void refreshWalletBalance();
      const opps = await getEarnOpportunities(provider);
      setOpportunities(opps);
      setOpportunityId((cur) => (opps.some((o) => o.id === cur) ? cur : (opps[0]?.id ?? '')));
      refreshPosition();
    } catch {
      /* transient - keep the current snapshot */
    } finally {
      setRefreshing(false);
    }
  }

  const title = step === 'form' ? 'Earn' : txTitle;

  return (
    <div className="chettapay-overlay" style={overlayStyle} onClick={!isInProgress ? onClose : undefined}>
      <div
        className="chettapay-modal-card chettapay-send-modal"
        data-theme={theme}
        style={cssVars}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chettapay-modal-header">
          <div className="chettapay-send-header-left">
            {showBack && (
              <button type="button" className="chettapay-modal-close" onClick={handleBack} aria-label="Back">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <h2 className="chettapay-modal-title">{title}</h2>
          </div>
          <div className="chettapay-modal-header-actions">
            {step === 'form' && !earnUnavailable && !smartUnsupported && (
              <button
                type="button"
                className="chettapay-modal-close"
                onClick={() => void handleRefresh()}
                disabled={refreshing || providersLoading}
                aria-label="Refresh"
              >
                <svg
                  className={refreshing ? 'chettapay-modal-refresh-icon chettapay-spinning' : 'chettapay-modal-refresh-icon'}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3h-3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            {!isInProgress && (
              <button type="button" className="chettapay-modal-close" onClick={onClose} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {step === 'form' && earnUnavailable && <div className="chettapay-modal-error">Earn is not available for this app.</div>}

        {step === 'form' && !earnUnavailable && (
          <>
            {smartUnsupported && (
              <div className="chettapay-modal-error">Earn is not yet available for smart (passkey) wallets.</div>
            )}

            {/* Deposit / Withdraw tabs */}
            <div className="chettapay-tabs">
              <button
                type="button"
                className="chettapay-tab"
                data-active={tab === 'deposit'}
                onClick={() => {
                  setTab('deposit');
                  setFormError('');
                }}
              >
                Deposit
              </button>
              <button
                type="button"
                className="chettapay-tab"
                data-active={tab === 'withdraw'}
                onClick={() => {
                  setTab('withdraw');
                  setFormError('');
                }}
              >
                Withdraw
              </button>
            </div>

            {/* Provider */}
            {providers && providers.length > 1 && (
              <div className="chettapay-send-field">
                <label className="chettapay-send-label">Provider</label>
                <select
                  className="chettapay-input chettapay-send-select"
                  value={provider ?? ''}
                  onChange={(e) => setProvider(e.target.value as EarnProviderId)}
                >
                  {providers.map((p) => (
                    <option key={p} value={p}>
                      {PROVIDER_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Opportunity */}
            <div className="chettapay-send-field">
              <label className="chettapay-send-label">{provider === 'defindex' ? 'Vault' : 'Pool'}</label>
              {loadingOpps || providersLoading ? (
                <div className="chettapay-input chettapay-select-loading">
                  <span className="chettapay-spinner chettapay-spinner-sm" />
                  <span>Loading options…</span>
                </div>
              ) : (
                <select
                  className="chettapay-input chettapay-send-select"
                  value={opportunityId}
                  disabled={opportunities.length === 0}
                  onChange={(e) => setOpportunityId(e.target.value)}
                >
                  {opportunities.length === 0 ? (
                    <option value="">None available</option>
                  ) : (
                    opportunities.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} · {o.apy.toFixed(2)}% APY
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            {/* Live position panel */}
            {selectedOpportunity && (
              <div className="chettapay-swap-quote">
                {tab === 'deposit' && (
                  <div className="chettapay-swap-quote-row">
                    <span className="chettapay-send-hint">In your wallet</span>
                    <span>
                      {walletAvailable != null ? formatAmount(walletAvailable) : '…'} {assetCode}
                    </span>
                  </div>
                )}
                <div className="chettapay-swap-quote-row">
                  <span className="chettapay-send-hint">Your position</span>
                  <span>
                    {position ? formatAmount(position.balance) : '…'} {assetCode}
                  </span>
                </div>
                <div className="chettapay-swap-quote-row">
                  <span className="chettapay-send-hint">APY</span>
                  <span className="chettapay-earn-live">{selectedOpportunity.apy.toFixed(2)}%</span>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="chettapay-send-field">
              <div className="chettapay-send-label-row">
                <label className="chettapay-send-label">{tab === 'deposit' ? 'Amount' : 'Withdraw amount'}</label>
                {tab === 'deposit' && walletAvailable != null && (
                  <button type="button" className="chettapay-swap-custom-toggle" onClick={() => setAmount(walletAvailable)}>
                    Max: {formatAmount(walletAvailable)} {amountUnitLabel}
                  </button>
                )}
                {tab === 'withdraw' && position && (
                  <button
                    type="button"
                    className="chettapay-swap-custom-toggle"
                    onClick={() => setAmount(position.withdrawable)}
                  >
                    Max: {formatAmount(position.withdrawable)} {amountUnitLabel}
                  </button>
                )}
              </div>
              <div className="chettapay-earn-amount">
                <input
                  className="chettapay-input"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {amountUnitLabel && <span className="chettapay-earn-amount-unit">{amountUnitLabel}</span>}
              </div>
            </div>

            {formError && <div className="chettapay-modal-error">{formError}</div>}

            {depositNeedsTrustline && selectedOpportunity && (
              <div className="chettapay-swap-trustline-notice">
                To deposit {assetCode} your wallet needs a trustline. This will create it first (~0.5 XLM reserve, refundable if
                you later remove it), then deposit — two signatures.
              </div>
            )}

            <div className="chettapay-modal-actions">
              <button className="chettapay-btn-primary" onClick={() => void handleSubmit()} disabled={!canSubmit}>
                {tab === 'deposit' ? (depositNeedsTrustline ? 'Enable trustline & deposit' : 'Deposit') : 'Withdraw'}
              </button>
            </div>
          </>
        )}

        {step === 'tx' && (
          <TxStatusView
            transaction={transaction}
            showXdr={showXdr}
            copied={copied}
            explorerUrl={explorerUrl}
            walletType={walletType}
            onSignAndSend={() => {}}
            onToggleXdr={() => setShowXdr((v) => !v)}
            onCopyHash={handleCopyHash}
            onRetry={() => void handleRetry()}
            onDone={onClose}
          />
        )}

        <ChettaPayModalFooter />
      </div>
    </div>
  );
}
