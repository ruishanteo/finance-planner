import { describe, expect, it } from 'vitest';
import { BANKS } from '../data/banks';
import { optimizePortfolio } from './optimizePortfolio';

describe('optimizePortfolio', () => {
  it('returns a plan with positive interest for a typical profile', () => {
    const plan = optimizePortfolio(BANKS, {
      totalBalance: 100_000,
      monthlySalary: 5_000,
      monthlySpend: 1_000,
      canSave: true,
      canInvest: false,
      canInsure: false,
      maxBanks: 3,
    });

    expect(plan.slots.length).toBeGreaterThan(0);
    expect(plan.totalAnnualInterest).toBeGreaterThan(0);
    expect(
      plan.slots.reduce((sum, s) => sum + s.slot.balance, 0),
    ).toBeCloseTo(100_000, 0);
  });

  it('can split spend across two banks when it improves interest', () => {
    const plan = optimizePortfolio(BANKS, {
      totalBalance: 100_000,
      monthlySalary: 0,
      monthlySpend: 1_000,
      canSave: true,
      canInvest: false,
      canInsure: false,
      maxBanks: 3,
    });

    const spendSlots = plan.slots.filter((s) => s.slot.spendAmount > 0);
    const totalSpend = spendSlots.reduce((sum, s) => sum + s.slot.spendAmount, 0);
    expect(totalSpend).toBeCloseTo(1_000, 0);
  });

  it('assigns save without salary on OCBC when salary is zero', () => {
    const plan = optimizePortfolio(BANKS, {
      totalBalance: 50_000,
      monthlySalary: 0,
      monthlySpend: 0,
      canSave: true,
      canInvest: false,
      canInsure: false,
      maxBanks: 2,
    });

    const ocbc = plan.slots.find((s) => s.slot.bankId === 'ocbc-360');
    if (ocbc) {
      expect(ocbc.slot.save).toBe(true);
      expect(ocbc.slot.salary).toBe(false);
    }
  });

  it('reports uplift when multi-bank beats single bank', () => {
    const plan = optimizePortfolio(BANKS, {
      totalBalance: 150_000,
      monthlySalary: 5_000,
      monthlySpend: 1_000,
      canSave: true,
      canInvest: true,
      canInsure: false,
      maxBanks: 3,
    });

    expect(plan.singleBankBaseline).toBeGreaterThan(0);
    expect(plan.totalAnnualInterest).toBeGreaterThanOrEqual(plan.singleBankBaseline);
  });
});
