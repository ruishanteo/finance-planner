import {
  interestFromAdditiveBonuses,
  interestFromBonusComponents,
  interestFromPublishedScenario,
  scenarioLabel,
  selectPublishedScenario,
} from './qualification';
import type {
  ActivityKey,
  BankCalculation,
  BankProduct,
  PerBankActivities,
  RateBreakdownLine,
} from '../types';

function calculateAdditiveBankRate(
  bank: BankProduct,
  balance: number,
  activities: Partial<Record<ActivityKey, boolean>>,
): BankCalculation {
  const cap = bank.additiveCap ?? { maxRate: 4.65, maxBalance: 100_000 };

  const { interest, blendedRate, rateCapped, breakdown, activeBonusLabels } =
    interestFromAdditiveBonuses(
      balance,
      bank.baseRate,
      bank.bonusComponents,
      activities,
      cap,
    );

  const label =
    activeBonusLabels.length > 0
      ? `Additive: ${activeBonusLabels.join(', ')}`
      : 'Base rate only';

  return {
    bankId: bank.id,
    bankName: bank.name,
    effectiveRate: balance > 0 ? blendedRate : bank.baseRate,
    annualInterest: interest,
    monthlyInterest: interest / 12,
    breakdown,
    matchedScenarioId: null,
    matchedScenarioLabel: label,
    rateCapped,
  };
}

export function calculateBankRate(
  bank: BankProduct,
  balance: number,
  activities: Partial<Record<ActivityKey, boolean>>,
): BankCalculation {
  if (bank.calculationStrategy === 'additive-bonuses') {
    return calculateAdditiveBankRate(bank, balance, activities);
  }

  const scenario = selectPublishedScenario(bank, balance, activities);

  if (!scenario) {
    const annualInterest = (balance * bank.baseRate) / 100;
    return {
      bankId: bank.id,
      bankName: bank.name,
      effectiveRate: bank.baseRate,
      annualInterest,
      monthlyInterest: annualInterest / 12,
      breakdown: [{ label: 'Base rate (no published scenario)', rate: bank.baseRate }],
      matchedScenarioId: null,
      matchedScenarioLabel: null,
      rateCapped: false,
    };
  }

  const { interest: scenarioInterest, breakdown: scenarioBreakdown } =
    interestFromPublishedScenario(balance, bank.baseRate, scenario);

  let totalInterest = scenarioInterest;
  const breakdown: RateBreakdownLine[] = [
    { label: `Published: ${scenarioLabel(scenario)}`, rate: 0 },
    ...scenarioBreakdown,
  ];

  if (bank.calculationStrategy === 'scenario-plus-bonuses') {
    const { interest: bonusInterest, breakdown: bonusBreakdown } =
      interestFromBonusComponents(balance, bank.bonusComponents, activities);
    totalInterest += bonusInterest;
    breakdown.push(...bonusBreakdown);
  }

  const effectiveRate = balance > 0 ? (totalInterest / balance) * 100 : bank.baseRate;

  return {
    bankId: bank.id,
    bankName: bank.name,
    effectiveRate,
    annualInterest: totalInterest,
    monthlyInterest: totalInterest / 12,
    breakdown,
    matchedScenarioId: scenario.id,
    matchedScenarioLabel: scenarioLabel(scenario),
    rateCapped: false,
  };
}

export function calculateAllBanks(
  banks: BankProduct[],
  balance: number,
  perBankActivities: PerBankActivities,
): BankCalculation[] {
  return banks
    .map((bank) =>
      calculateBankRate(bank, balance, perBankActivities[bank.id] ?? {}),
    )
    .sort((a, b) => b.effectiveRate - a.effectiveRate);
}

export function bestBank(calculations: BankCalculation[]): BankCalculation | null {
  if (calculations.length === 0) return null;
  return calculations[0];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRate(rate: number): string {
  return `${rate.toFixed(2)}%`;
}
