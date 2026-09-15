'use client';

import { useMemo, useState } from 'react';
import type { InteractiveAuthAdapter } from '@chettapay/core';
import { LOGO_CHETTAPAY } from '../../constants';
import { ModalStatusBanner, ChettaPayModalFooter } from '../commons';
import { EmailCodeInput } from './EmailCodeInput';
import { GithubButton } from './GithubButton';
import { GoogleButton } from './GoogleButton';
import { buildModalCssVars, type ModalStyleOverrides } from '../modal-theme';

type StateStatus = 'NONE' | 'LOADING' | 'SUCCESS' | 'ERROR';

interface PrivyLoginSubmodalProps {
  /** The interactive adapter whose login (email/oauth) we drive. */
  adapter: InteractiveAuthAdapter;
  theme: string;
  accentColor: string;
  /** Per-app modal chrome overrides (background, card + button radius). */
  styleOverrides?: ModalStyleOverrides;
  logoUrl: string | null;
  appName: string;
  /** Return to the root login view. */
  onBack: () => void;
  /** Close the whole login modal. */
  onCancel: () => void;
  /** The provider login finished - hand off to `login({ provider })`. */
  onAuthenticated: () => void;
}

/**
 * Sub-modal for an {@link InteractiveAuthAdapter} (e.g. `@chettapay/privy-adapter`).
 * It renders the adapter's `getAuthOptions()` (email / Google / GitHub), runs the
 * provider login by calling the adapter's methods, then signals
 * {@link PrivyLoginSubmodalProps.onAuthenticated} so the host triggers the normal
 * `login({ provider })` (which runs `connect()` + SEP-10).
 *
 * Owned by `@chettapay/react`; reuses the login-modal CSS classes/vars.
 */
export function PrivyLoginSubmodal({
  adapter,
  theme,
  accentColor,
  styleOverrides,
  logoUrl,
  appName,
  onBack,
  onCancel,
  onAuthenticated,
}: PrivyLoginSubmodalProps) {
  const options = useMemo(() => adapter.getAuthOptions(), [adapter]);
  const [email, setEmail] = useState('');
  const [view, setView] = useState<'root' | 'email-code'>('root');
  const [status, setStatus] = useState<StateStatus>('NONE');
  const [message, setMessage] = useState('');

  const isLoading = status === 'LOADING';

  const cssVars = buildModalCssVars(theme, accentColor, styleOverrides, 'hero');

  function fail(error: unknown) {
    setStatus('ERROR');
    setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
  }

  async function handleEmailSubmit() {
    if (!email) return;
    setStatus('LOADING');
    setMessage('');
    try {
      await adapter.sendEmailCode(email);
      setStatus('SUCCESS');
      setMessage('Code sent — check your inbox');
      setView('email-code');
    } catch (error) {
      fail(error);
    }
  }

  async function handleCodeSubmit(code: string) {
    setStatus('LOADING');
    setMessage('Verifying…');
    try {
      await adapter.verifyEmailCode(code);
      onAuthenticated();
    } catch (error) {
      fail(error);
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setStatus('LOADING');
    setMessage('');
    try {
      // On web Privy may redirect for OAuth; completion then arrives after the
      // round-trip. Email login resolves in-session and is the robust path.
      await adapter.loginWithOAuth(provider);
      onAuthenticated();
    } catch (error) {
      fail(error);
    }
  }

  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button type="button" className="chettapay-back-btn" onClick={onClick} aria-label="Back">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );

  const showEmail = options.includes('email');
  const showGoogle = options.includes('google');
  const showGithub = options.includes('github');

  return (
    <div className="chettapay-modal-card chettapay-modal" style={cssVars} onClick={(e) => e.stopPropagation()}>
      <button type="button" className="chettapay-close-btn" onClick={onCancel} aria-label="Close">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="chettapay-header">
        <div className="chettapay-logo-wrap">
          <img src={logoUrl ?? LOGO_CHETTAPAY} alt="Logo" className="chettapay-logo" />
        </div>
        <h2 className="chettapay-title">{appName}</h2>
        <p className="chettapay-subtitle">{adapter.meta.label}</p>
      </div>

      {view === 'email-code' ? (
        <>
          <BackButton onClick={() => setView('root')} />
          <EmailCodeInput email={email} onSubmit={handleCodeSubmit} />
        </>
      ) : (
        <>
          <BackButton onClick={onBack} />
          {showEmail && (
            <div className="chettapay-email-section">
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                disabled={isLoading}
                className="chettapay-input"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
              />
              <button
                type="button"
                disabled={isLoading || !email}
                className="chettapay-btn-primary"
                style={{ marginTop: '0.75rem' }}
                onClick={handleEmailSubmit}
              >
                Submit
              </button>
            </div>
          )}

          {showEmail && (showGoogle || showGithub) && (
            <div className="chettapay-divider">
              <div className="chettapay-divider-line" />
              <div className="chettapay-divider-label">
                <span className="chettapay-divider-text">or continue with</span>
              </div>
            </div>
          )}

          {(showGoogle || showGithub) && (
            <div className="chettapay-social-list">
              {showGoogle && <GoogleButton disabled={isLoading} onClick={() => handleOAuth('google')} />}
              {showGithub && <GithubButton disabled={isLoading} onClick={() => handleOAuth('github')} />}
            </div>
          )}
        </>
      )}

      <ModalStatusBanner message={message} status={status} onCancel={onCancel} onRetry={undefined} />
      <ChettaPayModalFooter />
    </div>
  );
}
