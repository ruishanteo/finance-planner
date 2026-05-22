export type ActivityKey = 'salary' | 'spend' | 'save' | 'invest' | 'insure';

export interface ActivityMeta {
  key: ActivityKey;
  label: string;
  description: string;
}

export interface InterestTier {
  from: number;
  to: number;
  rate: number;
  label?: string;
}

export interface ScenarioRequirements {
  minimumSalary?: number;
  minimumSpend?: number;
}

export interface QualificationScenario {
  id: string;
  activities: ActivityKey[];
  effectiveRate: number;
  maxBalance: number;
  requirements: ScenarioRequirements;
  notes?: string;
  tiers?: InterestTier[];
}

export interface BonusComponent {
  id: string;
  label: string;
  activities: ActivityKey[];
  requirements: ScenarioRequirements;
  rate?: number;
  tiers?: InterestTier[];
  maxBalance?: number;
}

export type CalculationStrategy =
  | 'published-scenario'
  | 'scenario-plus-bonuses'
  | 'additive-bonuses';

export interface AdditiveCap {
  maxRate: number;
  maxBalance: number;
}

export type BankAccuracy = 'poor' | 'approximate' | 'good' | 'very-good';

export interface BankProduct {
  id: string;
  name: string;
  baseRate: number;
  bonusComponents: BonusComponent[];
  publishedScenarios: QualificationScenario[];
  calculationStrategy: CalculationStrategy;
  additiveCap?: AdditiveCap;
  accuracy: BankAccuracy;
  accuracyNote: string;
  source: string;
  notes?: string;
}

export interface RateBreakdownLine {
  label: string;
  rate: number;
  children?: RateBreakdownLine[];
}

export interface BankCalculation {
  bankId: string;
  bankName: string;
  effectiveRate: number;
  annualInterest: number;
  monthlyInterest: number;
  breakdown: RateBreakdownLine[];
  matchedScenarioId: string | null;
  matchedScenarioLabel: string | null;
  rateCapped: boolean;
}

export type PerBankActivities = Record<
  string,
  Partial<Record<ActivityKey, boolean>>
>;

/** Global inputs — what the user can do each month. */
export interface UserProfile {
  totalBalance: number;
  monthlySalary: number;
  monthlySpend: number;
  canSave: boolean;
  canInvest: boolean;
  canInsure: boolean;
  maxBanks: number;
}

/** One account in the optimized portfolio. */
export interface BankSlot {
  bankId: string;
  balance: number;
  salary: boolean;
  spendAmount: number;
  save: boolean;
  invest: boolean;
  insure: boolean;
}

export interface SlotResult {
  slot: BankSlot;
  bankName: string;
  calculation: BankCalculation;
}

export interface OptimizedPlan {
  slots: SlotResult[];
  totalAnnualInterest: number;
  totalMonthlyInterest: number;
  blendedEffectiveRate: number;
  singleBankBaseline: number;
  uplift: number;
  upliftPercent: number;
}
