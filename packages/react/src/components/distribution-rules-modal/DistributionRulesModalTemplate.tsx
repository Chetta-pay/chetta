'use client';

import { DistributionRule, DistributionRulesState } from '@chettapay/core';
import { ChettaPayModalFooter } from '../commons';
import { buildModalCssVars, type ModalStyleOverrides } from '../modal-theme';

interface DistributionRulesModalTemplateProps {
  theme: string;
  accentColor: string;
  /** Per-app modal chrome overrides (background, card + button radius). */
  styleOverrides?: ModalStyleOverrides;
  state: DistributionRulesState;
  claimingId: string | null;
  claimErrors: Record<string, string>;
  claimedIds: Set<string>;
  onRefresh: () => void;
  onClaim: (rule: DistributionRule) => void;
  onClose: () => void;
}

const PERIOD_LABEL: Record<DistributionRule['period'], string> = {
  DAY: 'every 24h',
  DAY_CALENDAR: 'daily',
  WEEK: 'every 7 days',
  MONTH: 'every 30 days',
  MONTH_CALENDAR: 'monthly',
  LIFETIME: 'one-time',
};

// Reasons returned by sdk-api are the ErrorCode enum values from
// @chettapay/shared. Mapped to short user-facing strings; anything unknown
// falls back to "Not available".
const REASON_LABEL: Record<string, string> = {
  DISTRIBUTION_RULE_DISABLED: 'Disabled',
  DISTRIBUTION_RULE_NOT_STARTED: 'Not started yet',
  DISTRIBUTION_RULE_EXPIRED: 'Expired',
  DISTRIBUTION_RULE_EXHAUSTED: 'Fully claimed',
  // Per-user, per-window claim limit (resets next period) - not permanent.
  DISTRIBUTION_RATE_LIMIT_EXCEEDED: 'Claimed for this period',
};

function reasonLabel(reason: string | null): string {
  if (!reason) return 'Not available';
  return REASON_LABEL[reason] ?? 'Not available';
}

function formatAmount(amount: string): string {
  const n = parseFloat(amount);
  return isNaN(n) ? amount : n.toLocaleString(undefined, { maximumFractionDigits: 7 });
}

function formatValidity(rule: DistributionRule): string | null {
  const from = rule.validFrom ? new Date(rule.validFrom) : null;
  const until = rule.validUntil ? new Date(rule.validUntil) : null;
  if (!from && !until) return null;
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  if (from && until) return `${fmt(from)} → ${fmt(until)}`;
  if (until) return `Until ${fmt(until)}`;
  if (from) return `From ${fmt(from)}`;
  return null;
}

function RuleCard({
  rule,
  isClaiming,
  isClaimed,
  errorMessage,
  onClaim,
}: {
  rule: DistributionRule;
  isClaiming: boolean;
  isClaimed: boolean;
  errorMessage?: string;
  onClaim: () => void;
}) {
  const validity = formatValidity(rule);
  const effectivelyClaimable = rule.claimable && !isClaimed;

  return (
    <div className="chettapay-dist-item" data-claimable={effectivelyClaimable ? 'true' : 'false'}>
      <div className="chettapay-dist-item-row">
        <span className="chettapay-dist-item-name">{rule.name}</span>
        <span className="chettapay-dist-item-amount">
          {formatAmount(rule.amount)} <span className="chettapay-dist-item-asset">{rule.assetCode}</span>
        </span>
      </div>
      <div className="chettapay-dist-item-meta">
        <span>{PERIOD_LABEL[rule.period]}</span>
        {validity && <span>· {validity}</span>}
      </div>
      <div className="chettapay-dist-item-action">
        {isClaimed ? (
          <span className="chettapay-dist-item-status" data-kind="claimed">
            Claimed
          </span>
        ) : effectivelyClaimable ? (
          <button
            type="button"
            className="chettapay-btn-primary chettapay-dist-claim-btn"
            onClick={onClaim}
            disabled={isClaiming}
          >
            {isClaiming ? (
              <>
                <span className="chettapay-spinner chettapay-spinner-sm" />
                Claiming…
              </>
            ) : (
              'Claim'
            )}
          </button>
        ) : (
          <span className="chettapay-dist-item-status" data-kind="unavailable">
            {reasonLabel(rule.reason)}
          </span>
        )}
      </div>
      {errorMessage && <div className="chettapay-dist-item-error">{errorMessage}</div>}
    </div>
  );
}

export function DistributionRulesModalTemplate({
  theme,
  accentColor,
  styleOverrides,
  state,
  claimingId,
  claimErrors,
  claimedIds,
  onRefresh,
  onClaim,
  onClose,
}: DistributionRulesModalTemplateProps) {
  const cssVars = buildModalCssVars(theme, accentColor, styleOverrides);

  const isLoading = state.step === 'loading';
  const rules = state.step === 'loaded' ? state.rules : [];

  return (
    <div
      className="chettapay-modal-card chettapay-dist-modal"
      data-theme={theme}
      style={cssVars}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="chettapay-modal-header">
        <h2 className="chettapay-modal-title">Distribution Rules</h2>
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

      <div className="chettapay-dist-list">
        {isLoading && (
          <div className="chettapay-loading-block">
            <div className="chettapay-spinner" />
            <span>Loading…</span>
          </div>
        )}
        {state.step === 'error' && <div className="chettapay-modal-error">{state.message}</div>}
        {state.step === 'loaded' && rules.length === 0 && (
          <div className="chettapay-modal-empty">No distribution rules available.</div>
        )}
        {rules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            isClaiming={claimingId === rule.id}
            isClaimed={claimedIds.has(rule.id)}
            {...(claimErrors[rule.id] && { errorMessage: claimErrors[rule.id] })}
            onClaim={() => onClaim(rule)}
          />
        ))}
      </div>

      <ChettaPayModalFooter />
    </div>
  );
}
