import { calculateBankRate } from './calculateInterest';
import { bankById } from './bankMeta';
import { slotHasAssignment, slotToActivities } from './slotActivities';
import type {
  BankProduct,
  BankSlot,
  OptimizedPlan,
  SlotResult,
  UserProfile,
} from '../types';

export function evaluateSlots(
  banks: BankProduct[],
  profile: UserProfile,
  slots: BankSlot[],
): OptimizedPlan {
  const active = slots.filter(slotHasAssignment);
  const results: SlotResult[] = [];

  for (const slot of active) {
    if (slot.balance <= 0) continue;

    const bank = bankById(banks, slot.bankId);
    const activities = slotToActivities(slot, bank, profile);
    const calculation = calculateBankRate(bank, slot.balance, activities);

    results.push({
      slot,
      bankName: bank.name,
      calculation,
    });
  }

  const totalAnnualInterest = results.reduce(
    (sum, r) => sum + r.calculation.annualInterest,
    0,
  );

  return {
    slots: results,
    totalAnnualInterest,
    totalMonthlyInterest: totalAnnualInterest / 12,
    blendedEffectiveRate:
      profile.totalBalance > 0
        ? (totalAnnualInterest / profile.totalBalance) * 100
        : 0,
    singleBankBaseline: 0,
    uplift: 0,
    upliftPercent: 0,
  };
}

export function withBaseline(
  plan: OptimizedPlan,
  singleBankBaseline: number,
): OptimizedPlan {
  const uplift = plan.totalAnnualInterest - singleBankBaseline;
  return {
    ...plan,
    singleBankBaseline,
    uplift,
    upliftPercent:
      singleBankBaseline > 0 ? (uplift / singleBankBaseline) * 100 : 0,
  };
}
