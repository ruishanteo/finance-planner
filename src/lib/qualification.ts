import {
  bandAmount,
  componentEir,
  componentInterest,
  componentTiers,
  formatTierRange,
  interestFromTiers,
} from './tiers';
import type {
  ActivityKey,
  BankProduct,
  BonusComponent,
  QualificationScenario,
  RateBreakdownLine,
  ScenarioRequirements,
} from '../types';

export function requirementsMet(
  requirements: ScenarioRequirements,
  activities: Partial<Record<ActivityKey, boolean>>,
): boolean {
  if (requirements.minimumSalary !== undefined && !activities.salary) {
    return false;
  }
  if (requirements.minimumSpend !== undefined && !activities.spend) {
    return false;
  }
  return true;
}

export function scenarioQualifies(
  scenario: QualificationScenario,
  activities: Partial<Record<ActivityKey, boolean>>,
): boolean {
  if (!scenario.activities.every((activity) => activities[activity])) {
    return false;
  }
  return requirementsMet(scenario.requirements, activities);
}

export function bonusQualifies(
  component: BonusComponent,
  activities: Partial<Record<ActivityKey, boolean>>,
): boolean {
  if (!component.activities.every((activity) => activities[activity])) {
    return false;
  }
  return requirementsMet(component.requirements, activities);
}

export function supportedActivities(bank: BankProduct): Set<ActivityKey> {
  const keys = new Set<ActivityKey>();
  for (const scenario of bank.publishedScenarios) {
    for (const activity of scenario.activities) {
      keys.add(activity);
    }
  }
  for (const component of bank.bonusComponents) {
    for (const activity of component.activities) {
      keys.add(activity);
    }
  }
  return keys;
}

export function interestFromPublishedScenario(
  balance: number,
  baseRate: number,
  scenario: QualificationScenario,
): { interest: number; breakdown: RateBreakdownLine[] } {
  if (balance <= 0) {
    return { interest: 0, breakdown: [] };
  }

  if (scenario.tiers && scenario.tiers.length > 0) {
    const promotional = interestFromTiers(balance, scenario.tiers);
    const cap = scenario.tiers.reduce((max, t) => Math.max(max, t.to), 0);
    const eligible = Math.min(balance, cap);
    const remainder = Math.max(0, balance - eligible);

    const onRemainder = (remainder * baseRate) / 100;
    const interest = promotional + onRemainder;
    const totalEir = balance > 0 ? (interest / balance) * 100 : 0;

    const breakdown: RateBreakdownLine[] = [
      {
        label: `${scenario.notes || scenario.id} (${totalEir.toFixed(2)}% EIR)`,
        rate: totalEir,
        children: scenario.tiers.map((t) => {
          const amt = bandAmount(balance, t.from, t.to);
          return {
            label: `${formatTierRange(t)}: $${amt.toLocaleString()} @ ${t.rate.toFixed(2)}%`,
            rate: t.rate,
          };
        }),
      },
    ];

    if (remainder > 0) {
      breakdown.push({
        label: `${baseRate.toFixed(2)}% on $${remainder.toLocaleString()} above cap`,
        rate: (onRemainder / balance) * 100,
      });
    }

    return { interest, breakdown };
  }

  const eligible = Math.min(balance, scenario.maxBalance);
  const remainder = balance - eligible;

  const promotional = (eligible * scenario.effectiveRate) / 100;
  const onRemainder = (remainder * baseRate) / 100;
  const interest = promotional + onRemainder;

  const breakdown: RateBreakdownLine[] = [
    {
      label: `${scenario.effectiveRate.toFixed(2)}% on first $${eligible.toLocaleString()}`,
      rate: eligible > 0 ? (promotional / balance) * 100 : 0,
    },
  ];

  if (remainder > 0) {
    breakdown.push({
      label: `${baseRate.toFixed(2)}% on $${remainder.toLocaleString()} above cap`,
      rate: (onRemainder / balance) * 100,
    });
  }

  return { interest, breakdown };
}

export function interestFromBonusComponents(
  balance: number,
  components: BonusComponent[],
  activities: Partial<Record<ActivityKey, boolean>>,
): { interest: number; breakdown: RateBreakdownLine[] } {
  if (balance <= 0 || components.length === 0) {
    return { interest: 0, breakdown: [] };
  }

  let interest = 0;
  const breakdown: RateBreakdownLine[] = [];

  for (const component of components) {
    if (!bonusQualifies(component, activities)) continue;

    const slice = componentInterest(balance, component);
    interest += slice;
    breakdown.push(bonusBreakdownLine(balance, component));
  }

  return { interest, breakdown };
}

export function bonusBreakdownLine(
  balance: number,
  component: BonusComponent,
): RateBreakdownLine {
  const eir = componentEir(balance, component);
  const tiers = componentTiers(component);

  if (tiers.length === 1 && tiers[0].from === 0 && tiers[0].to === Infinity) {
    return {
      label: `${component.label} (+${tiers[0].rate.toFixed(2)}%)`,
      rate: (componentInterest(balance, component) / Math.max(balance, 1)) * 100,
    };
  }

  return {
    label: `${component.label} (${eir.toFixed(2)}% EIR)`,
    rate: (componentInterest(balance, component) / Math.max(balance, 1)) * 100,
    children: tiers.map((t) => ({
      label: `${formatTierRange(t)} @ ${t.rate.toFixed(2)}%`,
      rate: t.rate,
    })),
  };
}

export function selectPublishedScenario(
  bank: BankProduct,
  balance: number,
  activities: Partial<Record<ActivityKey, boolean>>,
): QualificationScenario | null {
  const qualifying = bank.publishedScenarios.filter((s) =>
    scenarioQualifies(s, activities),
  );

  if (qualifying.length === 0) return null;

  return qualifying.reduce((best, scenario) => {
    if (scenario.activities.length > best.activities.length) return scenario;
    if (scenario.activities.length < best.activities.length) return best;

    const bestInterest = interestFromPublishedScenario(balance, bank.baseRate, best)
      .interest;
    const scenarioInterest = interestFromPublishedScenario(
      balance,
      bank.baseRate,
      scenario,
    ).interest;
    return scenarioInterest > bestInterest ? scenario : best;
  });
}

export function scenarioLabel(scenario: QualificationScenario): string {
  return scenario.notes ?? scenario.id;
}

export function interestFromAdditiveBonuses(
  balance: number,
  baseRate: number,
  components: BonusComponent[],
  activities: Partial<Record<ActivityKey, boolean>>,
  cap: { maxRate: number; maxBalance: number },
): {
  interest: number;
  blendedRate: number;
  rateCapped: boolean;
  breakdown: RateBreakdownLine[];
  activeBonusLabels: string[];
} {
  if (balance <= 0) {
    return {
      interest: 0,
      blendedRate: baseRate,
      rateCapped: false,
      breakdown: [{ label: 'Base rate', rate: baseRate }],
      activeBonusLabels: [],
    };
  }

  const eligible = Math.min(balance, cap.maxBalance);
  const remainder = balance - eligible;

  let promotionalInterest = (eligible * baseRate) / 100;
  const breakdown: RateBreakdownLine[] = [{ label: 'Base rate', rate: baseRate }];
  const activeBonusLabels: string[] = [];

  for (const component of components) {
    if (!bonusQualifies(component, activities)) continue;

    const slice = componentInterest(balance, component);
    promotionalInterest += slice;
    breakdown.push(bonusBreakdownLine(balance, component));
    activeBonusLabels.push(component.label);
  }

  const maxPromotional = (eligible * cap.maxRate) / 100;
  const rateCapped = promotionalInterest > maxPromotional;
  if (rateCapped) {
    promotionalInterest = maxPromotional;
    breakdown.push({
      label: `Capped at ${cap.maxRate.toFixed(2)}% on first $${eligible.toLocaleString()}`,
      rate: cap.maxRate,
    });
  }

  const remainderInterest = (remainder * baseRate) / 100;
  const interest = promotionalInterest + remainderInterest;

  if (remainder > 0) {
    breakdown.push({
      label: `${baseRate.toFixed(2)}% on $${remainder.toLocaleString()} above cap`,
      rate: (remainderInterest / balance) * 100,
    });
  }

  return {
    interest,
    blendedRate: (interest / balance) * 100,
    rateCapped,
    breakdown,
    activeBonusLabels,
  };
}
