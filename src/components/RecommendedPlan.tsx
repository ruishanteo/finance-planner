import { formatCurrency, formatRate } from '../lib/calculateInterest';
import type { OptimizedPlan } from '../types';

interface RecommendedPlanProps {
  plan: OptimizedPlan;
  balance: number;
}

function activityTags(slot: OptimizedPlan['slots'][0]['slot']): string[] {
  const tags: string[] = [];
  if (slot.salary) tags.push('Salary');
  if (slot.spendAmount > 0) tags.push(`Spend $${slot.spendAmount.toLocaleString()}/mo`);
  if (slot.save) tags.push('Save');
  if (slot.invest) tags.push('Invest');
  if (slot.insure) tags.push('Insure');
  return tags;
}

export function RecommendedPlan({ plan, balance }: RecommendedPlanProps) {
  if (balance <= 0) {
    return (
      <section className="panel plan-panel muted">
        <h2>Recommended plan</h2>
        <p>Enter a balance above zero to generate a portfolio recommendation.</p>
      </section>
    );
  }

  if (plan.slots.length === 0) {
    return (
      <section className="panel plan-panel muted">
        <h2>Recommended plan</h2>
        <p>No qualifying allocation found for this profile.</p>
      </section>
    );
  }

  return (
    <section className="panel plan-panel">
      <h2>Recommended plan</h2>

      <div className="plan-summary">
        <div className="summary-stat">
          <span className="label">Total annual interest</span>
          <strong>{formatCurrency(plan.totalAnnualInterest)}</strong>
        </div>
        <div className="summary-stat">
          <span className="label">Blended effective rate</span>
          <strong>{formatRate(plan.blendedEffectiveRate)}</strong>
        </div>
        {plan.uplift > 0 && (
          <div className="summary-stat uplift">
            <span className="label">vs best single bank</span>
            <strong>
              +{formatCurrency(plan.uplift)} ({plan.upliftPercent.toFixed(1)}%)
            </strong>
          </div>
        )}
      </div>

      <table className="plan-table">
        <thead>
          <tr>
            <th>Bank</th>
            <th>Balance</th>
            <th>Activities</th>
            <th>Rate</th>
            <th>Annual interest</th>
          </tr>
        </thead>
        <tbody>
          {plan.slots.map(({ slot, bankName, calculation }) => (
            <tr key={slot.bankId}>
              <td>
                <strong>{bankName}</strong>
                {calculation.matchedScenarioLabel && (
                  <div className="cell-sub">{calculation.matchedScenarioLabel}</div>
                )}
              </td>
              <td>{formatCurrency(slot.balance)}</td>
              <td>
                <div className="tag-list">
                  {activityTags(slot).map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td>{formatRate(calculation.effectiveRate)}</td>
              <td>{formatCurrency(calculation.annualInterest)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>Total</td>
            <td>
              <strong>{formatCurrency(plan.totalAnnualInterest)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>

      <p className="hint">
        Baseline (one bank only): {formatCurrency(plan.singleBankBaseline)}/year. This plan
        uses {plan.slots.length} account{plan.slots.length === 1 ? '' : 's'}.
      </p>
    </section>
  );
}
