import type { ActivityKey, BankProduct } from '../types';

export function bankById(banks: BankProduct[], id: string): BankProduct {
  const bank = banks.find((b) => b.id === id);
  if (!bank) throw new Error(`Unknown bank: ${id}`);
  return bank;
}

export function bankSupportsActivity(
  bank: BankProduct,
  activity: ActivityKey,
): boolean {
  for (const component of bank.bonusComponents) {
    if (component.activities.includes(activity)) return true;
  }
  for (const scenario of bank.publishedScenarios) {
    if (scenario.activities.includes(activity)) return true;
  }
  return false;
}

export function getMinSpend(bank: BankProduct): number | undefined {
  let min: number | undefined;

  const consider = (value?: number) => {
    if (value === undefined) return;
    min = min === undefined ? value : Math.min(min, value);
  };

  for (const component of bank.bonusComponents) {
    if (component.activities.includes('spend')) {
      consider(component.requirements.minimumSpend);
    }
  }
  for (const scenario of bank.publishedScenarios) {
    if (scenario.activities.includes('spend')) {
      consider(scenario.requirements.minimumSpend);
    }
  }

  return min;
}

export function getMinSalary(bank: BankProduct): number | undefined {
  let min: number | undefined;

  const consider = (value?: number) => {
    if (value === undefined) return;
    min = min === undefined ? value : Math.min(min, value);
  };

  for (const component of bank.bonusComponents) {
    if (component.activities.includes('salary')) {
      consider(component.requirements.minimumSalary);
    }
  }
  for (const scenario of bank.publishedScenarios) {
    if (scenario.activities.includes('salary')) {
      consider(scenario.requirements.minimumSalary);
    }
  }

  return min;
}

export function getPromoCap(bank: BankProduct): number {
  if (bank.additiveCap) return bank.additiveCap.maxBalance;
  const scenarioCap = bank.publishedScenarios.reduce(
    (max, s) => Math.max(max, s.maxBalance),
    0,
  );
  return scenarioCap > 0 ? scenarioCap : Infinity;
}

export function salaryQualifies(bank: BankProduct, monthlySalary: number): boolean {
  const min = getMinSalary(bank);
  if (min === undefined) return false;
  return monthlySalary >= min;
}

export function spendQualifies(
  bank: BankProduct,
  spendAmount: number,
): boolean {
  const min = getMinSpend(bank);
  if (min === undefined) return spendAmount > 0;
  return spendAmount >= min;
}
