'use client';

import { EnabledAssetRecord, EnabledAssetsState, WalletChain } from '@chettapay/core';
import { useState } from 'react';
import { ChainSelect, resolveChain } from '../ChainSelect';
import { BusyOverlay, CopyButton, cropAddress, ChettaPayModalFooter, Toggle, useStickyData } from '../commons';
import { buildModalCssVars, type ModalStyleOverrides } from '../modal-theme';

function assetKey(record: { code: string; issuer?: string }): string {
  return record.code + (record.issuer ?? '');
}

/** Row key. Chain-qualified: the same code+issuer can exist on two chains. */
function rowKey(record: EnabledAssetRecord): string {
  return (record.chain ?? '') + assetKey(record);
}

function AssetItem({
  record,
  busy,
  disabled,
  onToggle,
}: {
  record: EnabledAssetRecord;
  busy: boolean;
  disabled: boolean;
  onToggle: (record: EnabledAssetRecord) => void;
}) {
  // Absent means "not established": an unknown trustline must never render as
  // an on switch, which would read as already enabled.
  const established = record.trustlineEstablished ?? false;
  const isNative = record.type === 'native';
  // A trustline is a Stellar concept. On Polygon/Solana a token is simply held,
  // so those rows are informational: no label, no switch.
  const isStellar = resolveChain(record.chain) === 'STELLAR';

  return (
    <div className="chettapay-asset-item">
      <div className="chettapay-asset-info">
        <div className="chettapay-asset-code-row">
          <span className="chettapay-asset-code">{record.code}</span>
          {record.enabledInApp && <span className="chettapay-asset-tag">App</span>}
        </div>
        {record.name && <span className="chettapay-asset-name">{record.name}</span>}
        {record.issuer && (
          <span className="chettapay-issuer">
            <span className="chettapay-issuer-addr">{cropAddress(record.issuer)}</span>
            <CopyButton value={record.issuer} label="Copy issuer address" className="chettapay-copy-btn-sm" />
          </span>
        )}
        {isStellar && !isNative && record.enabledInApp && (
          <span className="chettapay-asset-sponsor">
            {record.sponsored ? 'Reserve sponsored by the app' : 'You pay the reserve (~0.5 XLM)'}
          </span>
        )}
      </div>
      {isStellar && (
        <div className="chettapay-asset-actions">
          <span className="chettapay-asset-trustline-label">Trustline</span>
          {/* Native XLM needs no trustline - it is implicit and can't be removed,
              so the switch shows the state but stays locked on. */}
          <Toggle
            checked={established}
            busy={busy}
            disabled={isNative || disabled}
            onChange={() => onToggle(record)}
            label={`${established ? 'Disable' : 'Enable'} ${record.code} trustline`}
          />
        </div>
      )}
    </div>
  );
}

export interface EnabledAssetsModalTemplateProps {
  theme: string;
  accentColor: string;
  /** Per-app modal chrome overrides (background, card + button radius). */
  styleOverrides?: ModalStyleOverrides;
  enabledAssets: EnabledAssetsState;
  /** Address of the wallet on {@link selectedChain}. */
  walletAddress: string;
  /** Networks the user holds a wallet on; the first one is the default. */
  chains: WalletChain[];
  selectedChain: WalletChain | null;
  onSelectChain: (chain: WalletChain) => void;
  /** Key (`code+issuer`) of the asset whose trustline action is in flight. */
  busyKey: string | null;
  actionError: string | null;
  onRefresh: () => void;
  onClose: () => void;
  onToggleTrustline: (record: EnabledAssetRecord) => void;
  onAddCustom: () => void;
}

export function EnabledAssetsModalTemplate({
  theme,
  accentColor,
  styleOverrides,
  enabledAssets,
  walletAddress,
  chains,
  selectedChain,
  onSelectChain,
  busyKey,
  actionError,
  onRefresh,
  onClose,
  onToggleTrustline,
  onAddCustom,
}: EnabledAssetsModalTemplateProps) {
  const cssVars = buildModalCssVars(theme, accentColor, styleOverrides);

  const isLoading = enabledAssets.step === 'loading';
  // Keep the previous payload on screen while refreshing; the overlay below
  // blocks interaction so nothing is acted on against data that is changing.
  const data = useStickyData(enabledAssets.step === 'loaded' ? enabledAssets.data : null);
  const busy = busyKey !== null;
  // Only the picked network's assets. The backend returns every chain in one
  // payload, so this is a local filter - switching networks costs no request.
  const assets = (data?.assets ?? []).filter((a) => resolveChain(a.chain) === selectedChain);
  // Trustlines are Stellar-only, so the custom-trustline form is offered only
  // while Stellar is the selected network.
  const isStellarSelected = selectedChain === 'STELLAR';

  return (
    <div
      className="chettapay-modal-card chettapay-asset-modal"
      data-theme={theme}
      style={cssVars}
      onClick={(e) => e.stopPropagation()}
    >
      {isLoading && data && <BusyOverlay label="Refreshing assets…" />}

      <div className="chettapay-modal-header">
        <h2 className="chettapay-modal-title">Assets</h2>
        <div className="chettapay-modal-header-actions">
          <button
            type="button"
            className="chettapay-modal-close"
            onClick={onRefresh}
            disabled={isLoading || busy}
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

      <ChainSelect value={selectedChain} options={chains} onChange={onSelectChain} disabled={isLoading || busy} />

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

      {enabledAssets.step === 'error' && <div className="chettapay-modal-error">{enabledAssets.message}</div>}

      {actionError && <div className="chettapay-modal-action-error">{actionError}</div>}

      {data && !data.exists && <div className="chettapay-modal-empty">Account not found on {data.network}.</div>}

      {data && assets.length === 0 && <div className="chettapay-modal-empty">No assets found on this network.</div>}

      {data && assets.length > 0 && (
        <div className="chettapay-asset-list">
          {assets.map((a) => (
            <AssetItem
              key={rowKey(a)}
              record={a}
              busy={busyKey === assetKey(a)}
              disabled={busy && busyKey !== assetKey(a)}
              onToggle={onToggleTrustline}
            />
          ))}
        </div>
      )}

      {isStellarSelected && (
        <button className="chettapay-asset-add-custom" onClick={onAddCustom} disabled={busy}>
          + Add custom trustline
        </button>
      )}

      <ChettaPayModalFooter />
    </div>
  );
}

export interface CustomTrustlineModalTemplateProps {
  theme: string;
  accentColor: string;
  /** Per-app modal chrome overrides (background, card + button radius). */
  styleOverrides?: ModalStyleOverrides;
  busy: boolean;
  actionError: string | null;
  onBack: () => void;
  onClose: () => void;
  onSubmit: (input: { code: string; issuer: string; limit?: string }) => void;
}

function isValidIssuer(issuer: string): boolean {
  return issuer.length === 56 && issuer.startsWith('G');
}

export function CustomTrustlineModalTemplate({
  theme,
  accentColor,
  styleOverrides,
  busy,
  actionError,
  onBack,
  onClose,
  onSubmit,
}: CustomTrustlineModalTemplateProps) {
  const cssVars = buildModalCssVars(theme, accentColor, styleOverrides);

  const [code, setCode] = useState('');
  const [issuer, setIssuer] = useState('');
  const [limit, setLimit] = useState('');

  const codeOk = code.trim().length >= 1 && code.trim().length <= 12;
  const issuerOk = isValidIssuer(issuer.trim());
  const canSubmit = codeOk && issuerOk && !busy;

  const submit = () => {
    if (!canSubmit) return;
    const trimmedLimit = limit.trim();
    onSubmit({ code: code.trim(), issuer: issuer.trim(), ...(trimmedLimit ? { limit: trimmedLimit } : {}) });
  };

  return (
    <div
      className="chettapay-modal-card chettapay-asset-modal"
      data-theme={theme}
      style={cssVars}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="chettapay-modal-header">
        <div className="chettapay-modal-header-actions">
          <button className="chettapay-modal-close" onClick={onBack} disabled={busy} aria-label="Back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="chettapay-modal-title">Add custom trustline</h2>
        </div>
        <button className="chettapay-modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <p className="chettapay-asset-custom-hint">
        Custom trustlines aren&apos;t sponsored — your wallet pays the 0.5 XLM reserve and the transaction fee.
      </p>

      <div className="chettapay-field">
        <label className="chettapay-label" htmlFor="chettapay-trustline-code">
          Asset code
        </label>
        <input
          id="chettapay-trustline-code"
          className="chettapay-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="USDC"
          maxLength={12}
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
        />
      </div>

      <div className="chettapay-field">
        <label className="chettapay-label" htmlFor="chettapay-trustline-issuer">
          Issuer
        </label>
        <input
          id="chettapay-trustline-issuer"
          className="chettapay-input"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          placeholder="G…"
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
        />
        {issuer.trim().length > 0 && !issuerOk && (
          <span className="chettapay-field-error">Issuer must be a 56-character Stellar address starting with G.</span>
        )}
      </div>

      <div className="chettapay-field">
        <label className="chettapay-label" htmlFor="chettapay-trustline-limit">
          Limit <span className="chettapay-label-optional">(optional)</span>
        </label>
        <input
          id="chettapay-trustline-limit"
          className="chettapay-input"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="Maximum"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
        />
      </div>

      {actionError && <div className="chettapay-modal-action-error">{actionError}</div>}

      <div className="chettapay-modal-actions">
        <button type="button" className="chettapay-btn-primary" onClick={submit} disabled={!canSubmit}>
          {busy ? (
            <>
              <span className="chettapay-spinner chettapay-spinner-sm" />
              Enabling…
            </>
          ) : (
            'Enable trustline'
          )}
        </button>
      </div>

      <ChettaPayModalFooter />
    </div>
  );
}
