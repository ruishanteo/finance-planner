import type { CardProduct } from "../types";
import { rewardWithTiers } from "./utils";

/**
 * Singapore high-rewards credit cards (May 2026 snapshot).
 */
export const CARDS: CardProduct[] = [
  {
    id: "uob-one",
    name: "UOB One",
    annualFee: 192.6,
    network: "Mastercard",
    rewardType: "cashback",
    rewardComponents: [
      rewardWithTiers({ id: "one-low", minimumSpend: 600, cashbackRate: 3.33 }),
      rewardWithTiers({
        id: "one-mid",
        minimumSpend: 1000,
        cashbackRate: 3.33,
      }),
      rewardWithTiers({
        id: "one-high",
        minimumSpend: 2000,
        cashbackRate: 3.33,
      }),
    ],
    spendCategories: "general",
  },
];
