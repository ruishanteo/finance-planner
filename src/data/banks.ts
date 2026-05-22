import type { BankProduct } from "../types";
import { bonus, bonusWithTiers, scenario, scenarioWithTiers } from "./utils";

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
        "dbs-1cat-low",
        ["salary", "spend"],
        1.8,
        50_000,
        "Salary credit, 1 category, low min spend",
        {
          minimumSpend: 500,
        },
      ),
      scenario(
        "dbs-1cat-mid",
        ["salary", "spend"],
        1.9,
        50_000,
        "Salary credit, 1 category, mid min spend",
        {
          minimumSpend: 15000,
        },
      ),
      scenario(
        "dbs-1cat-high",
        ["salary", "spend"],
        2.2,
        50_000,
        "Salary credit, 1 category, high min spend",
        {
          minimumSpend: 30000,
        },
      ),
      scenario(
        "dbs-2cat-low",
        ["salary", "spend"],
        2.1,
        100_000,
        "Salary credit, 2 category, low min spend",
        {
          minimumSpend: 500,
        },
      ),
      scenario(
        "dbs-2cat-mid",
        ["salary", "spend"],
        2.2,
        100_000,
        "Salary credit, 2 category, mid min spend",
        {
          minimumSpend: 15000,
        },
      ),
      scenario(
        "dbs-2cat-high",
        ["salary", "spend"],
        1.8,
        100_000,
        "Salary credit, 2 category, high min spend",
        {
          minimumSpend: 30000,
        },
      ),
      scenario(
        "dbs-3cat-low",
        ["salary", "spend", "insure", "invest"],
        2.4,
        100_000,
        "Salary credit, 3 category, low min spend",
        {
          minimumSpend: 500,
        },
      ),
      scenario(
        "dbs-3cat-mid",
        ["salary", "spend", "insure", "invest"],
        2.5,
        100_000,
        "Salary credit, 3 category, mid min spend",
        {
          minimumSpend: 15000,
        },
      ),
      scenario(
        "dbs-3cat-high",
        ["salary", "spend", "insure", "invest"],
        4.1,
        100_000,
        "Salary credit, 3 category, high min spend",
        {
          minimumSpend: 30000,
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
      scenarioWithTiers(
        "uob-one-spend-only",
        ["spend"],
        0.35,
        150_000,
        { minimumSpend: 500 },
        "Spend min. S$500 only",
        [
          { from: 0, to: 75_000, rate: 0.65, label: "First $75k" },
          { from: 75_000, to: 150_000, rate: 0.05, label: "Next $75k" },
        ],
      ),
      scenarioWithTiers(
        "uob-one-spend-salary",
        ["spend", "salary"],
        1.9,
        150_000,
        { minimumSpend: 500, minimumSalary: 1600 },
        "Spend min. S$500 + Salary credit",
        [
          { from: 0, to: 75_000, rate: 1.0, label: "First $75k" },
          { from: 75_000, to: 125_000, rate: 2.5, label: "Next $50k" },
          { from: 125_000, to: 150_000, rate: 3.4, label: "Next $25k" },
        ],
      ),
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
    calculationStrategy: "additive-bonuses",
    additiveCap: { maxRate: 5.85, maxBalance: 100_000 },
    bonusComponents: [
      bonus("bonussaver-salary", "Salary credit ($3,000+)", ["salary"], 0.9, {
        minimumSalary: 3000,
      }),
      bonus("bonussaver-spend", "Card spend ($1000+)", ["spend"], 0.9, {
        minimumSpend: 1000,
      }),
      bonus(
        "bonussaver-invest",
        "Eligible Unit Trust or Online Equities of at least $30,000",
        ["invest"],
        1.5,
      ),
      bonus("bonussaver-insure", "Eligible insurance", ["insure"], 2.5),
    ],
    publishedScenarios: [],
    accuracy: "very-good",
    accuracyNote:
      "Investment and insurance bonuses require additional qualifying products.",
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
      scenarioWithTiers(
        "saveup-1",
        ["spend"],
        0.53,
        75_000,
        { minimumSpend: 500 },
        "Spend min. S$500 only",
        [
          { from: 0, to: 50_000, rate: 0.3, label: "First $50k" },
          { from: 50_000, to: 75_000, rate: 1.0, label: "Next $25k" },
        ],
      ),
      scenarioWithTiers(
        "saveup-1",
        ["salary"],
        0.53,
        75_000,
        { minimumSalary: 2000 },
        "Minimum salary 2000 or $300 monthly GIRO payments to other billing organisations",
        [
          { from: 0, to: 50_000, rate: 0.3, label: "First $50k" },
          { from: 50_000, to: 75_000, rate: 1.0, label: "Next $25k" },
        ],
      ),
      scenarioWithTiers(
        "saveup-2",
        ["spend", "salary"],
        1.17,
        75_000,
        { minimumSpend: 500, minimumSalary: 2000 },
        "Spend min. S$500 only and min salary 2000 or $300 monthly GIRO payments to other billing organisations",
        [
          { from: 0, to: 50_000, rate: 1.0, label: "First $50k" },
          { from: 50_000, to: 75_000, rate: 1.5, label: "Next $25k" },
        ],
      ),
      scenarioWithTiers(
        "saveup-3",
        ["spend", "salary", "insure"],
        3.08,
        75_000,
        { minimumSpend: 500, minimumSalary: 2000 },
        "Spend min. S$500 only and min salary 2000 or $300 monthly GIRO payments to other billing organisations",
        [
          { from: 0, to: 50_000, rate: 2.75, label: "First $50k" },
          { from: 50_000, to: 75_000, rate: 3.75, label: "Next $25k" },
        ],
      ),
      scenarioWithTiers(
        "saveup-3",
        ["spend", "salary", "invest"],
        3.08,
        75_000,
        { minimumSpend: 500, minimumSalary: 2000 },
        "Spend min. S$500 only and min salary 2000 or $300 monthly GIRO payments to other billing organisations",
        [
          { from: 0, to: 50_000, rate: 2.75, label: "First $50k" },
          { from: 50_000, to: 75_000, rate: 3.75, label: "Next $25k" },
        ],
      ),
    ],
    notes:
      "Rates depend on number of qualifying product categories maintained.",
    source: "https://bankpicker.sg/best-savings-accounts",
  },

  {
    id: "uob-stash",
    name: "UOB Stash Account",
    baseRate: 0.05,
    calculationStrategy: "additive-bonuses",
    additiveCap: { maxRate: 1.95, maxBalance: 100_000 },
    bonusComponents: [
      bonusWithTiers(
        "stash-save",
        "Maintain or increase monthly average balance compared to previous month",
        ["save"],
        [
          { from: 0, to: 10_000, rate: 0.0, label: "First $10k" },
          { from: 10_000, to: 40_000, rate: 1.35, label: "Next $30k" },
          { from: 40_000, to: 70_000, rate: 1.55, label: "Next $30k" },
          { from: 70_000, to: 100_000, rate: 1.95, label: "Next $30k" },
        ],
        {},
      ),
    ],
    publishedScenarios: [],
    accuracy: "very-good",
    accuracyNote:
      "Additive independent bonuses; save does not require salary. Capped at 1.95% on first $100k.",
    notes:
      "Each bonus stacks when its activity is met. Investment and insurance rates may be campaign-dependent.",
    source:
      "https://www.uob.com.sg/personal/save/savings-accounts/stash-account.page",
  },
];
