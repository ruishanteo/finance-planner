import type {
  ActivityKey,
  BonusComponent,
  InterestTier,
  QualificationScenario,
  RewardComponent,
  ScenarioRequirements,
} from "../types";

/**
 * Banks
 */
export function scenario(
  id: string,
  activities: ActivityKey[],
  effectiveRate: number,
  maxBalance: number,
  notes: string,
  requirements: ScenarioRequirements = {},
): QualificationScenario {
  return {
    id,
    activities,
    effectiveRate,
    maxBalance,
    requirements,
    notes,
  };
}

export function scenarioWithTiers(
  id: string,
  activities: ActivityKey[],
  effectiveRate: number,
  maxBalance: number,
  requirements: ScenarioRequirements = {},
  notes: string,
  tiers: InterestTier[],
): QualificationScenario {
  return {
    id,
    activities,
    effectiveRate,
    maxBalance,
    requirements,
    notes,
    tiers,
  };
}

export function bonus(
  id: string,
  label: string,
  activities: ActivityKey[],
  rate: number,
  requirements: ScenarioRequirements = {},
): BonusComponent {
  return { id, label, activities, rate, requirements };
}

export function bonusWithTiers(
  id: string,
  label: string,
  activities: ActivityKey[],
  tiers: InterestTier[],
  requirements: ScenarioRequirements = {},
): BonusComponent {
  return { id, label, activities, tiers, requirements };
}

/**
 * Credit Cards
 */

export function rewardWithTiers({
  id,
  minimumSpend,
  cashbackRate,
  pointsMultiplier,
  milesPerDollar,
}: RewardComponent): RewardComponent {
  return {
    id,
    minimumSpend,
    cashbackRate,
    pointsMultiplier,
    milesPerDollar,
  };
}
