import { ACTIVITIES } from '../data/banks';
import { supportedActivities } from '../lib/qualification';
import { formatCurrency, formatRate } from '../lib/calculateInterest';
import type { ActivityKey, BankCalculation, BankProduct } from '../types';

interface BankCardProps {
  bank: BankProduct;
  calculation: BankCalculation;
  activities: Partial<Record<ActivityKey, boolean>>;
  onToggleActivity: (activity: ActivityKey, enabled: boolean) => void;
  rank: number;
  isBest: boolean;
}

export function BankCard({
  bank,
  calculation,
  activities,
  onToggleActivity,
  rank,
  isBest,
}: BankCardProps) {
  const supported = supportedActivities(bank);

  return (
    <article className={`bank-card ${isBest ? 'best' : ''}`}>
      <header className="bank-card-header">
        <div>
          <span className="rank">#{rank}</span>
          <h3>{bank.name}</h3>
          {isBest && <span className="badge">Best rate</span>}
        </div>
        <div className="rate-block">
          <span className="effective-rate">{formatRate(calculation.effectiveRate)}</span>
          <span className="rate-label">p.a.</span>
        </div>
      </header>

      <div className="interest-summary">
        <div>
          <span className="label">Est. annual interest</span>
          <strong>{formatCurrency(calculation.annualInterest)}</strong>
        </div>
        <div>
          <span className="label">Est. monthly</span>
          <strong>{formatCurrency(calculation.monthlyInterest)}</strong>
        </div>
      </div>

      <fieldset className="activities">
        <legend>Activities with this bank</legend>
        <div className="activity-grid">
          {ACTIVITIES.map((meta) => {
            const available = supported.has(meta.key);
            const checked = Boolean(activities[meta.key]);

            return (
              <label
                key={meta.key}
                className={available ? 'activity-toggle' : 'activity-toggle disabled'}
                title={meta.description}
              >
                <input
                  type="checkbox"
                  disabled={!available}
                  checked={checked}
                  onChange={(e) => onToggleActivity(meta.key, e.target.checked)}
                />
                <span>{meta.label}</span>
                {!available && <span className="na">N/A</span>}
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className={`accuracy accuracy-${bank.accuracy}`}>
        Model fit: {bank.accuracyNote}
      </p>

      {calculation.matchedScenarioLabel && (
        <p className="matched-rule">
          {bank.calculationStrategy === 'additive-bonuses' ? 'Active' : 'Published scenario'}:{' '}
          <strong>{calculation.matchedScenarioLabel}</strong>
        </p>
      )}

      {calculation.rateCapped && (
        <p className="cap-hint">Blended rate capped at product maximum on eligible balance.</p>
      )}

      <details className="breakdown">
        <summary>Rate breakdown</summary>
        <ul>
          {calculation.breakdown.map((line, index) => (
            <li key={`${line.label}-${index}`}>
              <div className="breakdown-row">
                <span>{line.label}</span>
                <span>{formatRate(line.rate)}</span>
              </div>
              {line.children && (
                <ul className="breakdown-children">
                  {line.children.map((child, childIndex) => (
                    <li key={`${child.label}-${childIndex}`}>
                      <span>{child.label}</span>
                      <span>{formatRate(child.rate)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        {bank.notes && <p className="bank-note">{bank.notes}</p>}
        <p className="bank-note">
          <a href={bank.source} target="_blank" rel="noreferrer">
            Rate source
          </a>
        </p>
      </details>
    </article>
  );
}
