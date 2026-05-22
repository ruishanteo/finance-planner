import { describe, expect, it } from 'vitest';
import { BANKS } from '../data/banks';
import { componentEir, componentInterest, effectiveRateFromTiers } from './tiers';

describe('tier EIR', () => {
  it('computes 1.25% EIR for OCBC salary tiers at $100k', () => {
    const salary = BANKS.find((b) => b.id === 'ocbc-360')!.bonusComponents.find(
      (c) => c.id === 'ocbc-salary',
    )!;

    expect(componentInterest(100_000, salary)).toBeCloseTo(1250, 0);
    expect(componentEir(100_000, salary)).toBeCloseTo(1.25, 2);
    expect(effectiveRateFromTiers(100_000, salary.tiers!)).toBeCloseTo(1.25, 2);
  });

  it('only applies first tier when balance is below $75k', () => {
    const salary = BANKS.find((b) => b.id === 'ocbc-360')!.bonusComponents.find(
      (c) => c.id === 'ocbc-salary',
    )!;

    expect(componentInterest(50_000, salary)).toBeCloseTo(500, 0);
    expect(componentEir(50_000, salary)).toBeCloseTo(1.0, 2);
  });
});
