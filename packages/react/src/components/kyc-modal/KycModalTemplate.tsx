'use client';

import type { KycProvider, KycStartResponse, KycStatus as KycStatusValue } from '@chettapay/core';
import { buildModalCssVars, type ModalStyleOverrides } from '../modal-theme';
import { KycStatus as KycStatusBadge } from './KycStatus';

export type KycStep = 'select_provider' | 'verifying' | 'polling' | 'done';

interface KycModalTemplateProps {
  theme: string;
  accentColor: string;
  /** Per-app modal chrome overrides (background, card + button radius). */
  styleOverrides?: ModalStyleOverrides;
  step: KycStep;
  providers: KycProvider[];
  selectedProvider: KycProvider | null;
  session: KycStartResponse | null;
  kycStatus: KycStatusValue;
  isLoading: boolean;
  onSelectProvider: (provider: KycProvider) => void;
  onDoneVerifying: () => void;
  onRefresh: () => void;
  onClose: () => void;
}

export function KycModalTemplate({
  theme,
  accentColor,
  styleOverrides,
  step,
  providers,
  selectedProvider,
  session,
  kycStatus,
  isLoading,
  onSelectProvider,
  onDoneVerifying,
  onRefresh,
  onClose,
}: KycModalTemplateProps) {
  const cssVars = buildModalCssVars(theme, accentColor, styleOverrides, 'hero');

  return (
    <div className="chettapay-modal-card chettapay-kyc-modal" style={cssVars} onClick={(e) => e.stopPropagation()}>
      <div className="chettapay-modal-header">
        <div className="chettapay-kyc-header-text">
          <h2 className="chettapay-modal-title">Identity verification</h2>
          <p className="chettapay-kyc-subtitle">
            {step === 'select_provider' && 'Choose your verification provider'}
            {step === 'verifying' && `Verifying with ${selectedProvider?.name}`}
            {step === 'polling' && 'Waiting for verification result'}
            {step === 'done' && 'Verification complete'}
          </p>
        </div>
        <div className="chettapay-modal-header-actions">
          {step === 'select_provider' && (
            <button
              type="button"
              className="chettapay-modal-close"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh"
              title="Refresh providers"
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
          )}
          <button type="button" className="chettapay-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {step === 'select_provider' &&
        (isLoading && providers.length === 0 ? (
          <div className="chettapay-loading-block">
            <div className="chettapay-spinner" />
            <span>Loading providers…</span>
          </div>
        ) : (
          <div className="chettapay-kyc-providers">
            {providers.length === 0 && (
              <p style={{ color: 'var(--chettapay-muted)', textAlign: 'center' }}>No providers available for your country.</p>
            )}
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                className="chettapay-kyc-provider-btn"
                disabled={isLoading}
                onClick={() => onSelectProvider(p)}
              >
                <span className="chettapay-kyc-provider-name">{p.name}</span>
                <span className="chettapay-kyc-provider-flow">{p.flow}</span>
              </button>
            ))}
          </div>
        ))}

      {step === 'verifying' && selectedProvider && (
        <>
          <div className="chettapay-kyc-iframe-wrap">
            {session?.kycUrl ? (
              <iframe
                className="chettapay-kyc-iframe"
                src={session.kycUrl}
                title="KYC verification"
                allow="camera; microphone"
              />
            ) : (
              <div className="chettapay-kyc-iframe-mock">
                <span>🔒</span>
                <span>
                  {selectedProvider.flow === 'form'
                    ? 'The identity verification form will appear here.'
                    : 'Identity verification will open here.'}
                </span>
              </div>
            )}
          </div>
          <div className="chettapay-modal-actions">
            <button type="button" className="chettapay-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="chettapay-btn-primary" onClick={onDoneVerifying}>
              I've completed verification
            </button>
          </div>
        </>
      )}

      {step === 'polling' && (
        <div className="chettapay-kyc-polling">
          <div className="chettapay-spinner" />
          <p className="chettapay-kyc-polling-text">Checking verification status…</p>
        </div>
      )}

      {step === 'done' && (
        <div className="chettapay-kyc-result">
          <span className="chettapay-kyc-result-icon">{kycStatus === 'approved' ? '✅' : '❌'}</span>
          <KycStatusBadge status={kycStatus} />
          <p className="chettapay-kyc-result-text">
            {kycStatus === 'approved'
              ? 'Your identity has been verified successfully.'
              : 'Verification was not approved. Please try again.'}
          </p>
          <div className="chettapay-modal-actions">
            <button type="button" className="chettapay-btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
