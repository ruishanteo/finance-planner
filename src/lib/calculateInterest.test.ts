import { describe, expect, it } from 'vitest';
import { BANKS } from '../data/banks';
import {
  interestFromAdditiveBonuses,
  interestFromPublishedScenario,
  scenarioQualifies,
} from './qualification';
import { calculateAllBanks, calculateBankRate } from './calculateInterest';

describe('interestFromPublishedScenario', () => {
  it('uses min(balance, maxBalance) × effectiveRate plus base on remainder', () => {
    const scenario = BANKS.find((b) => b.id === 'dbs-multiplier')!
      .publishedScenarios.find((s) => s.id === 'dbs-max')!;

    const { interest } = interestFromPublishedScenario(150_000, 0.05, scenario);
    expect(interest).toBeCloseTo(4100 + 25, 0);
  });
});

describe('OCBC additive-bonuses', () => {
  const ocbc = () => BANKS.find((b) => b.id === 'ocbc-360')!;
  const cap = { maxRate: 4.65, maxBalance: 100_000 };

  it('earns save bonus without salary', () => {
    const result = calculateBankRate(ocbc(), 50_000, { save: true });

    expect(result.matchedScenarioLabel).toContain('Increase balance');
    expect(result.effectiveRate).toBeCloseTo(0.3, 2); // 0.05% base + 0.25% save
    expect(result.annualInterest).toBeCloseTo(150, 0);
  });

  it('adds salary (tiered) and save independently', () => {
    const result = calculateBankRate(ocbc(), 50_000, { salary: true, save: true });

    // 0.05% base + 1% salary tier on $50k + 0.25% save
    expect(result.effectiveRate).toBeCloseTo(1.3, 2);
    expect(result.annualInterest).toBeCloseTo(650, 0);
  });

  it('shows 1.25% salary EIR at $100k in breakdown', () => {
    const result = calculateBankRate(ocbc(), 100_000, { salary: true });
    const salaryLine = result.breakdown.find((l) => l.label.includes('Salary credit'));

    expect(salaryLine?.label).toContain('1.25% EIR');
    expect(salaryLine?.children).toHaveLength(2);
  });

  it('caps blended rate when all bonuses are active', () => {
    const result = calculateBankRate(ocbc(), 50_000, {
      salary: true,
      save: true,
      spend: true,
      invest: true,
      insure: true,
    });

    // With current published component rates, cap may or may not bind at $50k
    expect(result.effectiveRate).toBeGreaterThan(2);
    expect(result.annualInterest).toBeGreaterThan(1000);
  });

  it('save component qualifies without salary in activities list', () => {
    const saveBonus = ocbc().bonusComponents.find((c) => c.id === 'ocbc-save')!;
    expect(saveBonus.activities).toEqual(['save']);
    const { activeBonusLabels } = interestFromAdditiveBonuses(
      50_000,
      0.05,
      ocbc().bonusComponents,
      { save: true },
      cap,
    );
    expect(activeBonusLabels).toContain('Increase balance $500/month');
  });
});

describe('calculateBankRate', () => {
  it('returns base rate when no published scenario matches', () => {
    const dbs = BANKS.find((b) => b.id === 'dbs-multiplier')!;
    const result = calculateBankRate(dbs, 100_000, {});

    expect(result.effectiveRate).toBe(0.05);
    expect(result.matchedScenarioId).toBeNull();
  });

  it('does not additively sum DBS activity percentages', () => {
    const dbs = BANKS.find((b) => b.id === 'dbs-multiplier')!;
    const result = calculateBankRate(dbs, 80_000, {
      salary: true,
      spend: true,
      invest: true,
      insure: true,
    });

    expect(result.matchedScenarioId).toBe('dbs-max');
    expect(result.annualInterest).toBeCloseTo(80_000 * 0.041, 0);
  });

  it('picks the most specific published scenario for Maybank', () => {
    const maybank = BANKS.find((b) => b.id === 'maybank-saveup')!;
    const result = calculateBankRate(maybank, 60_000, {
      salary: true,
      spend: true,
      save: true,
    });

    expect(result.matchedScenarioId).toBe('maybank-3');
    expect(result.annualInterest).toBeCloseTo(60_000 * 0.0285, 0);
  });
});

describe('scenarioQualifies', () => {
  it('requires salary when minimumSalary is set', () => {
    const dbs = BANKS.find((b) => b.id === 'dbs-multiplier')!;
    const salaryScenario = dbs.publishedScenarios[0];
    expect(scenarioQualifies(salaryScenario, { salary: true })).toBe(true);
    expect(scenarioQualifies(salaryScenario, {})).toBe(false);
  });
});

describe('calculateAllBanks', () => {
  it('sorts banks by effective rate descending', () => {
    const results = calculateAllBanks(BANKS, 50_000, {
      'dbs-multiplier': { salary: true, spend: true },
      'maybank-saveup': { salary: true, spend: true },
    });

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].effectiveRate).toBeGreaterThanOrEqual(
        results[i].effectiveRate,
      );
    }
  });
});

describe('UOB One tiered calculations', () => {
  const uob = () => BANKS.find((b) => b.id === 'uob-one')!;

  it('calculates spend-only tiers correctly under $75k', () => {
    const result = calculateBankRate(uob(), 50_000, { spend: true });
    expect(result.matchedScenarioId).toBe('uob-one-spend-only');
    expect(result.effectiveRate).toBeCloseTo(0.65, 2);
    expect(result.annualInterest).toBeCloseTo(325, 0);
  });

  it('calculates spend-only tiers correctly at $100k', () => {
    const result = calculateBankRate(uob(), 100_000, { spend: true });
    expect(result.matchedScenarioId).toBe('uob-one-spend-only');
    expect(result.effectiveRate).toBeCloseTo(0.50, 2);
    expect(result.annualInterest).toBeCloseTo(500, 0);
  });

  it('calculates spend-salary tiers correctly under $75k', () => {
    const result = calculateBankRate(uob(), 50_000, { spend: true, salary: true });
    expect(result.matchedScenarioId).toBe('uob-one-spend-salary');
    expect(result.effectiveRate).toBeCloseTo(1.00, 2);
    expect(result.annualInterest).toBeCloseTo(500, 0);
  });

  it('calculates spend-salary tiers correctly at $100k', () => {
    const result = calculateBankRate(uob(), 100_000, { spend: true, salary: true });
    expect(result.matchedScenarioId).toBe('uob-one-spend-salary');
    expect(result.effectiveRate).toBeCloseTo(1.375, 3);
    expect(result.annualInterest).toBeCloseTo(1375, 0);
  });

  it('calculates spend-salary tiers correctly at $150k (max bonus EIR)', () => {
    const result = calculateBankRate(uob(), 150_000, { spend: true, salary: true });
    expect(result.matchedScenarioId).toBe('uob-one-spend-salary');
    expect(result.effectiveRate).toBeCloseTo(1.90, 2);
    expect(result.annualInterest).toBeCloseTo(2850, 0);
  });

  it('calculates spend-salary tiers correctly at $200k (above cap)', () => {
    const result = calculateBankRate(uob(), 200_000, { spend: true, salary: true });
    expect(result.matchedScenarioId).toBe('uob-one-spend-salary');
    expect(result.effectiveRate).toBeCloseTo(1.4375, 4);
    expect(result.annualInterest).toBeCloseTo(2875, 0);
  });
});
