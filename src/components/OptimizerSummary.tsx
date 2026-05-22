import { formatCurrency, formatRate } from '../lib/calculateInterest';
import type { BankCalculation } from '../types';

interface OptimizerSummaryProps {
  best: BankCalculation | null;
  balance: number;
  bankCount: number;
}

export function OptimizerSummary({ best, balance, bankCount }: OptimizerSummaryProps) {
  if (!best || balance <= 0) {
    return (
      <section className="panel summary-panel muted">
        <h2>Plan</h2>
        <p>Set a balance above zero to see which static product pays the most interest.</p>
      </section>
    );
  }

  return (
    <section className="panel summary-panel">
      <h2>Recommended plan</h2>
      <p className="plan-text">
        With <strong>{formatCurrency(balance)}</strong> and your selected activities,{' '}
        <strong>{best.bankName}</strong> offers the highest effective rate at{' '}
        <strong>{formatRate(best.effectiveRate)}</strong> — about{' '}
        <strong>{formatCurrency(best.annualInterest)}</strong> per year (
        {formatCurrency(best.monthlyInterest)}/month).
      </p>
      <p className="hint">
        Comparing {bankCount} sample products. Live bank rates and eligibility rules can be
        plugged in later.
      </p>
    </section>
  );
}
