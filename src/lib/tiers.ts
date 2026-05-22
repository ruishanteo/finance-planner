import type { BonusComponent, InterestTier } from '../types';

export function bandAmount(balance: number, from: number, to: number): number {
  const upper = to === Infinity ? balance : Math.min(balance, to);
  return Math.max(0, upper - from);
}

export function interestFromTiers(balance: number, tiers: InterestTier[]): number {
  return tiers.reduce(
    (sum, tier) => sum + (bandAmount(balance, tier.from, tier.to) * tier.rate) / 100,
    0,
  );
}

/** Effective interest rate (EIR) = tier interest ÷ balance. */
export function effectiveRateFromTiers(balance: number, tiers: InterestTier[]): number {
  if (balance <= 0) return 0;
  return (interestFromTiers(balance, tiers) / balance) * 100;
}

export function formatTierRange(tier: InterestTier): string {
  const toLabel = tier.to === Infinity ? '+' : `–$${tier.to.toLocaleString()}`;
  return tier.label ?? `$${tier.from.toLocaleString()}${toLabel}`;
}

export function componentTiers(component: BonusComponent): InterestTier[] {
  if (component.tiers && component.tiers.length > 0) {
    return component.tiers;
  }
  if (component.rate !== undefined) {
    const cap = component.maxBalance ?? Infinity;
    return [{ from: 0, to: cap, rate: component.rate, label: 'Flat rate' }];
  }
  return [];
}

export function componentInterest(balance: number, component: BonusComponent): number {
  return interestFromTiers(balance, componentTiers(component));
}

export function componentEir(balance: number, component: BonusComponent): number {
  return effectiveRateFromTiers(balance, componentTiers(component));
}
