import type {
  ActivityMeta,
  ActivityKey,
  BankProduct,
  BonusComponent,
  InterestTier,
  QualificationScenario,
  ScenarioRequirements,
} from "../types";

function scenario(
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

function bonus(
  id: string,
  label: string,
  activities: ActivityKey[],
  rate: number,
  requirements: ScenarioRequirements = {},
): BonusComponent {
  return { id, label, activities, rate, requirements };
}

function bonusWithTiers(
  id: string,
  label: string,
  activities: ActivityKey[],
  tiers: InterestTier[],
  requirements: ScenarioRequirements = {},
): BonusComponent {
  return { id, label, activities, tiers, requirements };
}

/**
 * Singapore high-yield savings accounts (May 2026 snapshot).
 * Published comparison-style blended rates.
 */
export const BANKS: BankProduct[] = [
  {
    id: "dbs-multiplier",
    name: "DBS Multiplier",
    baseRate: 0.05,
    bonusComponents: [],
    calculationStrategy: "published-scenario",
    accuracy: "good",
    accuracyNote:
      "Published blended scenarios based on category combinations and eligible transaction volume.",
    publishedScenarios: [
      scenario(
        "dbs-salary-only",
        ["salary"],
        1.8,
        50_000,
        "Salary credit only ($2,000+)",
        {
          minimumSalary: 2000,
        },
      ),

      scenario(
        "dbs-salary-spend",
        ["salary", "spend"],
        2.2,
        100_000,
        "Salary + card spend",
        {
          minimumSalary: 2000,
          minimumSpend: 500,
        },
      ),

      scenario(
        "dbs-salary-spend-invest",
        ["salary", "spend", "invest"],
        3.0,
        100_000,
        "Salary + spend + invest",
        {
          minimumSalary: 2000,
          minimumSpend: 500,
        },
      ),

      scenario(
        "dbs-max",
        ["salary", "spend", "invest", "insure"],
        4.1,
        100_000,
        "Salary + spend + invest + insure",
        {
          minimumSalary: 2000,
          minimumSpend: 500,
        },
      ),
    ],
    notes:
      "Real DBS calculations depend on income bands and eligible transaction categories.",
    source:
      "https://www.smartcalculator.sg/articles/multiplier-account-optimizer-sg-2026",
  },

  {
    id: "ocbc-360",
    name: "OCBC 360 Account",
    baseRate: 0.05,
    calculationStrategy: "additive-bonuses",
    additiveCap: { maxRate: 4.65, maxBalance: 100_000 },
    bonusComponents: [
      bonusWithTiers(
        "ocbc-salary",
        "Salary credit ($1,800+)",
        ["salary"],
        [
          { from: 0, to: 75_000, rate: 1.0, label: "First $75k" },
          { from: 75_000, to: 100_000, rate: 2.0, label: "Next $25k" },
        ],
        { minimumSalary: 1800 },
      ),
      bonus("ocbc-save", "Increase balance $500/month", ["save"], 0.25),
      bonus("ocbc-spend", "Card spend ($500+)", ["spend"], 0.4, {
        minimumSpend: 500,
      }),
      bonusWithTiers(
        "ocbc-invest",
        "Eligible investments",
        ["invest"],
        [
          { from: 0, to: 75_000, rate: 1.0, label: "First $75k" },
          { from: 75_000, to: 100_000, rate: 2.0, label: "Next $25k" },
        ],
        {},
      ),
      bonusWithTiers(
        "ocbc-insure",
        "Eligible insurance",
        ["insure"],
        [
          { from: 0, to: 75_000, rate: 1.0, label: "First $75k" },
          { from: 75_000, to: 100_000, rate: 2.0, label: "Next $25k" },
        ],
        {},
      ),
    ],
    publishedScenarios: [],
    accuracy: "very-good",
    accuracyNote:
      "Additive independent bonuses; save does not require salary. Capped at 4.65% on first $100k.",
    notes:
      "Each bonus stacks when its activity is met. Investment and insurance rates may be campaign-dependent.",
    source: "https://bankpicker.sg/savings/ocbc-360",
  },

  {
    id: "uob-one",
    name: "UOB One Account",
    baseRate: 0.05,
    bonusComponents: [],
    calculationStrategy: "published-scenario",
    publishedScenarios: [
      {
        id: "uob-one-spend-only",
        activities: ["spend"],
        effectiveRate: 0.35,
        maxBalance: 150_000,
        requirements: { minimumSpend: 500 },
        notes: "Spend min. S$500 only",
        tiers: [
          { from: 0, to: 75_000, rate: 0.65, label: "First $75k" },
          { from: 75_000, to: 150_000, rate: 0.05, label: "Next $75k" },
        ],
      },
      {
        id: "uob-one-spend-salary",
        activities: ["spend", "salary"],
        effectiveRate: 1.90,
        maxBalance: 150_000,
        requirements: { minimumSpend: 500, minimumSalary: 1600 },
        notes: "Spend min. S$500 + Salary credit",
        tiers: [
          { from: 0, to: 75_000, rate: 1.00, label: "First $75k" },
          { from: 75_000, to: 125_000, rate: 2.50, label: "Next $50k" },
          { from: 125_000, to: 150_000, rate: 3.40, label: "Next $25k" },
        ],
      },
    ],
    accuracy: "very-good",
    accuracyNote:
      "Blended effective rates derived from published tranche schedules.",
    notes:
      "Underlying tranche payouts scale progressively across balance bands.",
    source:
      "https://www.smartcalculator.sg/articles/multiplier-account-optimizer-sg-2026",
  },

  {
    id: "sc-bonussaver",
    name: "Standard Chartered BonusSaver",
    baseRate: 0.05,
    bonusComponents: [],
    calculationStrategy: "published-scenario",
    accuracy: "good",
    accuracyNote:
      "Investment and insurance bonuses require additional qualifying products.",
    publishedScenarios: [
      scenario(
        "sc-salary-spend",
        ["salary", "spend"],
        2.05,
        100_000,
        "Salary + card spend",
        {
          minimumSalary: 3000,
          minimumSpend: 1000,
        },
      ),

      scenario(
        "sc-salary-spend-invest",
        ["salary", "spend", "invest"],
        4.55,
        100_000,
        "Salary + spend + invest",
        {
          minimumSalary: 3000,
          minimumSpend: 1000,
        },
      ),

      scenario(
        "sc-max",
        ["salary", "spend", "invest", "insure"],
        7.05,
        100_000,
        "Salary + spend + invest + insure",
        {
          minimumSalary: 3000,
          minimumSpend: 1000,
        },
      ),
    ],
    notes:
      "Maximum published rate depends on qualifying investment and insurance holdings.",
    source: "https://bankpicker.sg/savings/sc-bonussaver",
  },

  {
    id: "maybank-saveup",
    name: "Maybank SaveUp",
    baseRate: 0.25,
    bonusComponents: [],
    calculationStrategy: "published-scenario",
    accuracy: "approximate",
    accuracyNote:
      "Published category-count blended scenarios subject to campaign revisions.",
    publishedScenarios: [
      scenario("maybank-1", ["salary"], 1.45, 50_000, "1 qualifying category"),

      scenario(
        "maybank-2",
        ["salary", "spend"],
        2.25,
        75_000,
        "2 qualifying categories",
      ),

      scenario(
        "maybank-3",
        ["salary", "spend", "save"],
        2.85,
        75_000,
        "3 qualifying categories",
      ),

      scenario(
        "maybank-4",
        ["salary", "spend", "save", "invest"],
        3.45,
        75_000,
        "4 qualifying categories",
      ),

      scenario(
        "maybank-5",
        ["salary", "spend", "save", "invest", "insure"],
        4.25,
        75_000,
        "5 qualifying categories",
      ),
    ],
    notes:
      "Rates depend on number of qualifying product categories maintained.",
    source: "https://bankpicker.sg/best-savings-accounts",
  },
];

export const ACTIVITIES: ActivityMeta[] = [
  {
    key: "salary",
    label: "Salary credit",
    description: "GIRO salary into this account each month",
  },

  {
    key: "save",
    label: "Save",
    description:
      "Increase monthly balance or maintain qualifying GIRO activity",
  },

  {
    key: "spend",
    label: "Spend",
    description: "Meet monthly eligible card spend requirement",
  },

  {
    key: "invest",
    label: "Invest",
    description: "Hold eligible investments with the bank",
  },

  {
    key: "insure",
    label: "Insure",
    description: "Maintain eligible insurance policies",
  },
];
