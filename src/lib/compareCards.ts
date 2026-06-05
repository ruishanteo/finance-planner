import type {
  CardProduct,
  SpendCategories,
  UserSpendingProfile,
  RewardComponent,
} from "../types";

/**
 * Distributes a user's total monthly spend across categories.
 * If detailed breakdown is not enabled, maps 50% to the primary category and
 * divides the remaining 50% equally (12.5% each) among the other four categories.
 */
export function getSpendBreakdown(
  profile: UserSpendingProfile,
): Record<SpendCategories, number> {
  if (profile.useDetailedBreakdown) {
    return profile.spendBreakdown;
  }

  const categories: SpendCategories[] = [
    "dining",
    "online",
    "groceries",
    "travel",
    "general",
  ];
  const breakdown = {} as Record<SpendCategories, number>;
  const primary = profile.primaryCategory;

  // Distribute 50% to primary, and remaining 50% split across the rest (12.5% each)
  const primarySpend = Math.round(profile.monthlySpend * 0.5);
  let distributed = primarySpend;

  const others = categories.filter((c) => c !== primary);
  others.forEach((cat, index) => {
    if (index === others.length - 1) {
      // Avoid rounding issues by putting the remainder in the last category
      breakdown[cat] = Math.max(0, profile.monthlySpend - distributed);
    } else {
      const catSpend = Math.round(profile.monthlySpend * 0.125);
      breakdown[cat] = catSpend;
      distributed += catSpend;
    }
  });

  breakdown[primary] = primarySpend;
  return breakdown;
}

export interface CalculatedCardReward {
  card: CardProduct;
  totalMonthlyReward: number;
  categoryRewards: Record<SpendCategories, number>;
  isMinimumSpendMet: boolean;
  activeComponent: RewardComponent;
}

/**
 * Calculates the exact reward (cashback dollars or miles) a credit card earns
 * based on the category spending breakdown.
 */
export function calculateCardRewards(
  card: CardProduct,
  breakdown: Record<SpendCategories, number>,
): CalculatedCardReward {
  const categories: SpendCategories[] = [
    "dining",
    "online",
    "groceries",
    "travel",
    "general",
  ];
  const totalSpend = Object.values(breakdown).reduce(
    (sum, val) => sum + val,
    0,
  );

  // Find the highest minimum spend tier met by total spend
  // Sort descending by min spend to check the highest tiers first
  const sortedComponents = [...card.rewardComponents].sort(
    (a, b) => b.minimumSpend - a.minimumSpend,
  );

  let activeComponent = sortedComponents.find(
    (c) => totalSpend >= c.minimumSpend,
  );

  // If no tier is met, fallback to the base tier (typically minimumSpend: 0)
  if (!activeComponent) {
    activeComponent = sortedComponents[sortedComponents.length - 1];
  }

  const isMinimumSpendMet =
    activeComponent.minimumSpend > 0 ||
    card.rewardComponents.every((c) => c.minimumSpend === 0);
  const categoryRewards = {} as Record<SpendCategories, number>;

  // Special Handling for UOB One Card (flat tier-based monthly cash rebate)
  if (card.isUobOneSpecial) {
    let flatRebate = 0;
    if (totalSpend >= 2000) {
      flatRebate = 66.67; // $200 quarterly rebate / 3 months
    } else if (totalSpend >= 1000) {
      flatRebate = 33.33; // $100 quarterly rebate / 3 months
    } else if (totalSpend >= 500) {
      flatRebate = 16.67; // $50 quarterly rebate / 3 months
    }

    // Distribute the rebate proportionally across categories for UI visualization
    categories.forEach((cat) => {
      categoryRewards[cat] =
        totalSpend > 0 ? (breakdown[cat] / totalSpend) * flatRebate : 0;
    });

    return {
      card,
      totalMonthlyReward: flatRebate,
      categoryRewards,
      isMinimumSpendMet: totalSpend >= 500, // UOB One requires at least $500 monthly spend
      activeComponent,
    };
  }

  // Standard cards (Miles & Cashback)
  let totalReward = 0;
  const isMiles = card.rewardType === "miles";
  const baseRate = isMiles
    ? activeComponent.milesPerDollar || 0.4
    : activeComponent.cashbackRate || 0.003;

  categories.forEach((cat) => {
    const spend = breakdown[cat];
    if (spend <= 0) {
      categoryRewards[cat] = 0;
      return;
    }

    // Check if there is a category-specific rate in this active component
    const categoryRate = activeComponent.categoryRates?.[cat];

    if (categoryRate !== undefined) {
      // We have a bonus rate in this category!
      const cap = activeComponent.categoryCap;
      let reward = 0;

      if (cap !== undefined) {
        if (isMiles) {
          // Cap is on spend amount (e.g. Citi Rewards caps 4.0 mpd at $1,000 spend)
          const bonusSpend = Math.min(spend, cap);
          const baseSpend = Math.max(0, spend - cap);
          reward = bonusSpend * categoryRate + baseSpend * baseRate;
        } else {
          // Cap is on cashback amount (e.g. Citi Cash Back caps cashback at $25 per category)
          const bonusReward = spend * categoryRate;
          if (bonusReward > cap) {
            const spendUsedForBonus = cap / categoryRate;
            const excessSpend = Math.max(0, spend - spendUsedForBonus);
            reward = cap + excessSpend * baseRate;
          } else {
            reward = bonusReward;
          }
        }
      } else {
        // No cap on this category bonus
        reward = spend * categoryRate;
      }

      categoryRewards[cat] = reward;
      totalReward += reward;
    } else {
      // Standard base rate applies
      const reward = spend * baseRate;
      categoryRewards[cat] = reward;
      totalReward += reward;
    }
  });

  // Apply overall monthly reward cap if defined (e.g. OCBC 365 caps total cashback at $80/month)
  if (card.rewardCap !== undefined && totalReward > card.rewardCap) {
    const scalingFactor = card.rewardCap / totalReward;
    categories.forEach((cat) => {
      categoryRewards[cat] = categoryRewards[cat] * scalingFactor;
    });
    totalReward = card.rewardCap;
  }

  return {
    card,
    totalMonthlyReward: totalReward,
    categoryRewards,
    isMinimumSpendMet,
    activeComponent,
  };
}

export interface RecommendationResult {
  card: CardProduct;
  score: number;
  calculation: CalculatedCardReward;
}

/**
 * Calculates rewards for all cards, scores them, and returns them sorted.
 */
export function getRecommendedCards(
  cards: CardProduct[],
  profile: UserSpendingProfile,
): RecommendationResult[] {
  const breakdown = getSpendBreakdown(profile);

  const results = cards
    .filter((card) => card.rewardType === profile.rewardType)
    .map((card) => {
      const calculation = calculateCardRewards(card, breakdown);

      // Calculate Recommendation Score
      let score = 0;

      // 1. Reward volume: Primary factor
      // For cashback: $1 monthly reward = 2 points
      // For miles: 100 miles = 2 points (meaning 1 mile = 0.02 points, so $1 value equivalent if miles valued at 1c)
      if (card.rewardType === "cashback") {
        score += calculation.totalMonthlyReward * 2;
      } else {
        score += (calculation.totalMonthlyReward / 100) * 2;
      }

      // 2. Spend Category Match
      // Extra points if the card targets the user's primary spend category
      if (card.spendCategories === profile.primaryCategory) {
        score += 15;
      } else if (card.spendCategories === "general") {
        score += 5; // General cards are flexible
      }

      // 3. Annual Fee Adjustment
      // Lower annual fee is preferred
      if (card.annualFee === 0) {
        score += 10;
      } else if (card.annualFee <= 150) {
        score += 3;
      } else if (card.annualFee > 200) {
        score -= 5;
      }

      // 4. Minimum spend threshold penalty
      // If the user's total spend is below what the card requires for its best rates, penalize
      if (!calculation.isMinimumSpendMet) {
        score -= 25;
      }

      return {
        card,
        score,
        calculation,
      };
    });

  // Sort by score descending (highest recommendation first)
  return results.sort((a, b) => b.score - a.score);
}
