'use client';

import { StellarNetwork, WalletBalanceRecord, WalletBalanceState, WalletChain } from '@chettapay/core';
import { ChainSelect, resolveChain } from '../ChainSelect';
import { BusyOverlay, CopyButton, cropAddress, ChettaPayModalFooter, useStickyData } from '../commons';
import { buildModalCssVars, type ModalStyleOverrides } from '../modal-theme';

// Stellar amounts are int64 scaled by 10^7, so 7 decimals is the ledger's exact
// precision and the default. A Polygon/Solana token carries its own `decimals`
// and is rendered at that precision, capped at 7 so an 18-decimal ERC-20 doesn't
// blow the column apart. Digits are padded either way so amounts line up.
//
// A null balance means the chain could not be read. It renders as a dash, never
// as 0.0000000 - a wallet that failed to load must not look empty.
function formatBalance(balance: string | null, decimals = 7): string {
  if (balance === null) return '—';
  const digits = Math.min(decimals, 7);
  const n = parseFloat(balance);
  return isNaN(n) ? balance : n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** A testnet faucet for a given asset: where to top it up, and the link text. */
interface FaucetHint {
  url: string;
  label: string;
}

/**
 * The faucet for a balance row, or null when none applies. Testnet-only: the
 * caller passes `null` on mainnet, where these faucets don't fund. Solana's
 * native SOL points at the Solana faucet; USDC (an SPL token) at Circle's.
 */
function faucetFor(record: WalletBalanceRecord): FaucetHint | null {
  if (record.type === 'native') return { url: 'https://faucet.solana.com/', label: 'Get test SOL' };
  if (record.code === 'USDC') return { url: 'https://faucet.circle.com/', label: 'Get test USDC' };
  return null;
}

// No per-row chain tag: the list is filtered to the network picked in the
// header, so every row would carry the same tag.
function BalanceItem({ record, faucet }: { record: WalletBalanceRecord; faucet: FaucetHint | null }) {
  const balanceDiffers = record.balance !== record.available;
  return (
    <div className="chettapay-bal-item">
      <div className="chettapay-bal-asset-info">
        <span className="chettapay-bal-asset-code-row">
          <span className="chettapay-bal-asset">{record.code}</span>
        </span>
        {record.issuer && (
          <span className="chettapay-issuer">
            <span className="chettapay-issuer-addr">{cropAddress(record.issuer)}</span>
            <CopyButton value={record.issuer} label="Copy issuer address" className="chettapay-copy-btn-sm" />
          </span>
        )}
        {faucet && (
          <span className="chettapay-bal-faucet-hint">
            Need more?{' '}
            <a href={faucet.url} target="_blank" rel="noopener noreferrer">
              {faucet.label}
            </a>
            {/* ChettaPay's Solana testnet is the devnet cluster, and both faucets
                fund devnet - spell it out so nobody requests on the wrong one. */}
            <span className="chettapay-bal-faucet-net"> (devnet)</span>
          </span>
        )}
      </div>
      <div className="chettapay-bal-amounts">
        <span className="chettapay-bal-amount">{formatBalance(record.balance, record.decimals)}</span>
        {balanceDiffers && (
          <span className="chettapay-bal-available">{formatBalance(record.available, record.decimals)} available</span>
        )}
      </div>
    </div>
  );
}

export interface WalletBalanceModalTemplateProps {
  theme: string;
  accentColor: string;
  /** Per-app modal chrome overrides (background, card + button radius). */
  styleOverrides?: ModalStyleOverrides;
  walletBalance: WalletBalanceState;
  /** Address of the wallet on {@link selectedChain}. */
  walletAddress: string;
  /** Networks the user holds a wallet on; the first one is the default. */
  chains: WalletChain[];
  selectedChain: WalletChain | null;
  /** testnet vs mainnet - gates the Solana devnet faucet hint. */
  network: StellarNetwork;
  onSelectChain: (chain: WalletChain) => void;
  onRefresh: () => void;
  onClose: () => void;
}

export function WalletBalanceModalTemplate({
  theme,
  accentColor,
  styleOverrides,
  walletBalance,
  walletAddress,
  chains,
  selectedChain,
  network,
  onSelectChain,
  onRefresh,
  onClose,
}: WalletBalanceModalTemplateProps) {
  const cssVars = buildModalCssVars(theme, accentColor, styleOverrides);

  const isLoading = walletBalance.step === 'loading';
  // Keep the previous payload on screen while refreshing; the overlay below
  // blocks interaction so nothing is read against data that is changing.
  const data = useStickyData(walletBalance.step === 'loaded' ? walletBalance.data : null);
  // Only the picked network's balances. The backend returns every chain in one
  // payload, so this is a local filter - switching networks costs no request.
  const balances = (data?.balances ?? []).filter((b) => resolveChain(b.chain) === selectedChain);
  // These faucets fund devnet/testnet only, so mainnet gets no hint at all.
  const showFaucets = selectedChain === 'SOLANA' && network === 'testnet';

  return (
    <div
      className="chettapay-modal-card chettapay-bal-modal"
      data-theme={theme}
      style={cssVars}
      onClick={(e) => e.stopPropagation()}
    >
      {isLoading && data && <BusyOverlay label="Refreshing balances…" />}

      <div className="chettapay-modal-header">
        <h2 className="chettapay-modal-title">Wallet Balance</h2>
        <div className="chettapay-modal-header-actions">
          <button
            type="button"
            className="chettapay-modal-close"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh"
            title="Refresh"
          >
            <svg
              className={isLoading ? 'chettapay-modal-refresh-icon chettapay-spinning' : 'chettapay-modal-refresh-icon'}
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
          <button className="chettapay-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <ChainSelect value={selectedChain} options={chains} onChange={onSelectChain} disabled={isLoading} />

      {walletAddress && (
        <div className="chettapay-address-row">
          <span className="chettapay-address">{cropAddress(walletAddress)}</span>
          <CopyButton value={walletAddress} label="Copy wallet address" />
        </div>
      )}

      {/* First load only - a refresh keeps the old list under the overlay. */}
      {isLoading && !data && (
        <div className="chettapay-loading-block">
          <div className="chettapay-spinner" />
          <span>Loading…</span>
        </div>
      )}

      {walletBalance.step === 'error' && <div className="chettapay-modal-error">{walletBalance.message}</div>}

      {data && !data.exists && <div className="chettapay-modal-empty">Account not found on {data.network}.</div>}

      {data?.exists && balances.length === 0 && <div className="chettapay-modal-empty">No balances found on this network.</div>}

      {data?.exists && balances.length > 0 && (
        <div className="chettapay-bal-list">
          {balances.map((b) => (
            <BalanceItem
              key={(b.chain ?? '') + b.code + (b.issuer ?? '')}
              record={b}
              faucet={showFaucets ? faucetFor(b) : null}
            />
          ))}
        </div>
      )}

      <ChettaPayModalFooter />
    </div>
  );
}
