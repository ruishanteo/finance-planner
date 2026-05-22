import { calculateBankRate } from './calculateInterest';
import {
  bankSupportsActivity,
  getMinSpend,
  getPromoCap,
  salaryQualifies,
} from './bankMeta';
import { evaluateSlots, withBaseline } from './evaluatePlan';
import { emptySlot, slotToActivities } from './slotActivities';
import type { ActivityKey, BankProduct, BankSlot, OptimizedPlan, UserProfile } from '../types';

function combinations<T>(items: T[], k: number): T[][] {
  if (k <= 0) return [[]];
  if (items.length < k) return [];
  if (k === 1) return items.map((item) => [item]);

  const [first, ...rest] = items;
  const withFirst = combinations(rest, k - 1).map((combo) => [first, ...combo]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

function allocateBalance(
  banks: BankProduct[],
  profile: UserProfile,
  slots: BankSlot[],
): BankSlot[] {
  const active = slots.filter(
    (s) => s.salary || s.spendAmount > 0 || s.save || s.invest || s.insure,
  );

  if (active.length === 0) {
    return slots;
  }

  const scored = active
    .map((slot) => {
      const bank = banks.find((b) => b.id === slot.bankId)!;
      const testSlot = { ...slot, balance: profile.totalBalance };
      const calc = calculateBankRate(
        bank,
        profile.totalBalance,
        slotToActivities(testSlot, bank, profile),
      );
      return {
        bankId: slot.bankId,
        rate: calc.effectiveRate,
        cap: getPromoCap(bank),
      };
    })
    .sort((a, b) => b.rate - a.rate);

  let remaining = profile.totalBalance;
  const balanceByBank = new Map(slots.map((s) => [s.bankId, 0]));

  for (const { bankId, cap } of scored) {
    const assign = Math.min(remaining, cap === Infinity ? remaining : cap);
    balanceByBank.set(bankId, assign);
    remaining -= assign;
  }

  if (remaining > 0 && scored.length > 0) {
    balanceByBank.set(
      scored[0].bankId,
      (balanceByBank.get(scored[0].bankId) ?? 0) + remaining,
    );
  }

  return slots.map((s) => ({
    ...s,
    balance: balanceByBank.get(s.bankId) ?? 0,
  }));
}

function optimizeSpend(
  slots: BankSlot[],
  bankSet: BankProduct[],
  allBanks: BankProduct[],
  profile: UserProfile,
): BankSlot[] {
  if (profile.monthlySpend <= 0) {
    return slots.map((s) => ({ ...s, spendAmount: 0 }));
  }

  const spendBanks = bankSet.filter((b) => bankSupportsActivity(b, 'spend'));
  if (spendBanks.length === 0) return slots;

  let bestSlots = slots.map((s) => ({ ...s, spendAmount: 0 }));
  let bestInterest = -Infinity;

  const tryAlloc = (alloc: Record<string, number>) => {
    const test = slots.map((s) => ({
      ...s,
      spendAmount: alloc[s.bankId] ?? 0,
    }));
    const allocated = allocateBalance(allBanks, profile, test);
    const plan = evaluateSlots(allBanks, profile, allocated);
    if (plan.totalAnnualInterest > bestInterest) {
      bestInterest = plan.totalAnnualInterest;
      bestSlots = test;
    }
  };

  for (const bank of spendBanks) {
    const min = getMinSpend(bank) ?? 0;
    if (profile.monthlySpend >= min) {
      tryAlloc({ [bank.id]: profile.monthlySpend });
    }
  }

  for (let i = 0; i < spendBanks.length; i++) {
    for (let j = i + 1; j < spendBanks.length; j++) {
      const bankA = spendBanks[i];
      const bankB = spendBanks[j];
      const minA = getMinSpend(bankA) ?? 0;
      const minB = getMinSpend(bankB) ?? 0;
      const total = profile.monthlySpend;

      const splits: [number, number][] = [
        [minA, total - minA],
        [total - minB, minB],
        [total / 2, total / 2],
        [500, total - 500],
        [total - 500, 500],
      ];

      for (const [amtA, amtB] of splits) {
        if (amtA >= minA && amtB >= minB && Math.abs(amtA + amtB - total) < 1) {
          tryAlloc({ [bankA.id]: amtA, [bankB.id]: amtB });
        }
      }
    }
  }

  return bestSlots;
}

function assignActivity(
  slots: BankSlot[],
  bankSet: BankProduct[],
  allBanks: BankProduct[],
  profile: UserProfile,
  activity: ActivityKey,
): BankSlot[] {
  let bestSlots = slots;
  let bestInterest = evaluateSlots(
    allBanks,
    profile,
    allocateBalance(allBanks, profile, slots),
  ).totalAnnualInterest;

  for (const bank of bankSet) {
    if (!bankSupportsActivity(bank, activity)) continue;

    const testSlots = slots.map((s) =>
      s.bankId === bank.id ? { ...s, [activity]: true } : s,
    );
    const plan = evaluateSlots(
      allBanks,
      profile,
      allocateBalance(allBanks, profile, testSlots),
    );

    if (plan.totalAnnualInterest > bestInterest) {
      bestInterest = plan.totalAnnualInterest;
      bestSlots = testSlots;
    }
  }

  return bestSlots;
}

function optimizeForBankSet(
  allBanks: BankProduct[],
  bankSet: BankProduct[],
  profile: UserProfile,
): OptimizedPlan {
  let slots = bankSet.map((b) => emptySlot(b.id));

  if (profile.monthlySalary > 0) {
    let bestBankId = bankSet[0].id;
    let bestRate = -1;

    for (const bank of bankSet) {
      if (!salaryQualifies(bank, profile.monthlySalary)) continue;
      const slot = {
        ...emptySlot(bank.id),
        balance: profile.totalBalance,
        salary: true,
      };
      const calc = calculateBankRate(
        bank,
        profile.totalBalance,
        slotToActivities(slot, bank, profile),
      );
      if (calc.effectiveRate > bestRate) {
        bestRate = calc.effectiveRate;
        bestBankId = bank.id;
      }
    }

    slots = slots.map((s) =>
      s.bankId === bestBankId ? { ...s, salary: true } : s,
    );
  }

  if (profile.canSave) {
    slots = assignActivity(slots, bankSet, allBanks, profile, 'save');
  }
  if (profile.canInvest) {
    slots = assignActivity(slots, bankSet, allBanks, profile, 'invest');
  }
  if (profile.canInsure) {
    slots = assignActivity(slots, bankSet, allBanks, profile, 'insure');
  }

  slots = optimizeSpend(slots, bankSet, allBanks, profile);
  slots = allocateBalance(allBanks, profile, slots);

  return evaluateSlots(allBanks, profile, slots);
}

function findBestSingleBank(
  banks: BankProduct[],
  profile: UserProfile,
): OptimizedPlan {
  let best: OptimizedPlan | null = null;

  for (const bank of banks) {
    const slot: BankSlot = {
      bankId: bank.id,
      balance: profile.totalBalance,
      salary:
        profile.monthlySalary > 0 &&
        salaryQualifies(bank, profile.monthlySalary),
      spendAmount: profile.monthlySpend,
      save: profile.canSave && bankSupportsActivity(bank, 'save'),
      invest: profile.canInvest && bankSupportsActivity(bank, 'invest'),
      insure: profile.canInsure && bankSupportsActivity(bank, 'insure'),
    };

    const plan = evaluateSlots(banks, profile, [slot]);
    if (!best || plan.totalAnnualInterest > best.totalAnnualInterest) {
      best = plan;
    }
  }

  return best!;
}

export function optimizePortfolio(
  banks: BankProduct[],
  profile: UserProfile,
): OptimizedPlan {
  if (profile.totalBalance <= 0) {
    return {
      slots: [],
      totalAnnualInterest: 0,
      totalMonthlyInterest: 0,
      blendedEffectiveRate: 0,
      singleBankBaseline: 0,
      uplift: 0,
      upliftPercent: 0,
    };
  }

  const single = findBestSingleBank(banks, profile);
  let best = single;

  const maxK = Math.min(Math.max(1, profile.maxBanks), banks.length);

  for (let k = 2; k <= maxK; k++) {
    for (const combo of combinations(banks, k)) {
      const plan = optimizeForBankSet(banks, combo, profile);
      if (plan.totalAnnualInterest > best.totalAnnualInterest) {
        best = plan;
      }
    }
  }

  return withBaseline(best, single.totalAnnualInterest);
}
