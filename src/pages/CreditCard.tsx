import { useState } from "react";
import type {
  CardProduct,
  CardRewardType,
  UserSpendingProfile,
} from "../types";
import { UserCardForm } from "../components/UserCardForm";
import { CardRecommendation } from "../components/CardRecommendation";
import { CARDS } from "../data/cards";
import "../styles/CreditCard.css";

// Helper functions for reward calculation
function getEffectiveRewardRate(
  rewardComponents: CardProduct["rewardComponents"],
  monthlySpend: number,
  rewardType: CardRewardType,
): number {
  let applicableComponents =
    rewardType === "cashback"
      ? rewardComponents.filter((c) => c.cashbackRate !== undefined)
      : rewardComponents.filter((c) => c.milesPerDollar !== undefined);

  if (applicableComponents.length === 0) return 0;

  let bestRate = 0;
  for (const comp of applicableComponents) {
    if (monthlySpend >= comp.minimumSpend) {
      const rate =
        rewardType === "cashback" ? comp.cashbackRate : comp.milesPerDollar;
      if (rate && rate > bestRate) bestRate = rate;
    }
  }

  const baseComp = applicableComponents.find((c) => c.minimumSpend === 0);
  if (bestRate === 0 && baseComp) {
    const baseRate =
      rewardType === "cashback"
        ? baseComp.cashbackRate
        : baseComp.milesPerDollar;
    if (baseRate !== undefined && baseRate !== null) {
      bestRate = baseRate;
    }
  }

  return bestRate || 0;
}

function checkMinimumSpendEligibility(
  rewardComponents: CardProduct["rewardComponents"],
  monthlySpend: number,
  rewardType: CardRewardType,
): boolean {
  const relevantComponents =
    rewardType === "cashback"
      ? rewardComponents.filter((c) => c.cashbackRate !== undefined)
      : rewardComponents.filter((c) => c.milesPerDollar !== undefined);

  // If there's a component with minSpend > 0 that gives better rate, user should at least meet the lowest non-zero tier
  const hasBonusTier = relevantComponents.some((c) => c.minimumSpend > 0);
  if (!hasBonusTier) return true;

  // User can still use card but might miss bonus
  return (
    monthlySpend >=
    Math.min(
      ...relevantComponents.map((c) => c.minimumSpend).filter((m) => m > 0),
    )
  );
}

export function CreditCard() {
  const [profile, setProfile] = useState<UserSpendingProfile>({
    rewardType: "miles",
    monthlySpend: 2500,
    primaryCategory: "travel",
  });

  const [recommendations, setRecommendations] = useState<CardProduct[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateRecommendations = () => {
    const filtered = CARDS.filter(
      (card) => card.rewardType === profile.rewardType,
    );

    const scored = filtered.map((card) => {
      let score = 0;

      // Primary category match: highest weight
      if (card.spendCategories === profile.primaryCategory) {
        score += 30;
      } else if (card.spendCategories === "general") {
        score += 10; // general cards are flexible
      }

      // Get effective reward rate based on monthly spend
      const effectiveRate = getEffectiveRewardRate(
        card.rewardComponents,
        profile.monthlySpend,
        card.rewardType,
      );
      score += effectiveRate * 20; // higher rate = more points

      // Annual fee adjustment (lower fee = better, but premium cards with high fee might still be worth)
      if (card.annualFee === 0) score += 15;
      else if (card.annualFee <= 100) score += 5;
      else if (card.annualFee > 200) score -= 5;

      // Minimum spend eligibility check
      const meetsMinimum = checkMinimumSpendEligibility(
        card.rewardComponents,
        profile.monthlySpend,
        card.rewardType,
      );
      if (!meetsMinimum) score -= 20;

      return { card, score };
    });

    scored.sort((a, b) => b.score - a.score);
    setRecommendations(scored.map((s) => s.card));
    setHasGenerated(true);
  };

  return (
    <div className="credit-card-page">
      <div className="page-header">
        <h1>Card Recommender</h1>
        <p>
          Find the perfect credit card based on your spending habits and reward
          preferences
        </p>
      </div>

      <div className="dashboard two-column">
        <UserCardForm
          profile={profile}
          onChange={setProfile}
          onGenerate={generateRecommendations}
        />
        <CardRecommendation
          cards={recommendations}
          hasGenerated={hasGenerated}
          userSpend={profile.monthlySpend}
        />
      </div>
    </div>
  );
}
