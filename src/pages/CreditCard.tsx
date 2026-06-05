import { useState } from "react";
import type { UserSpendingProfile } from "../types";
import { UserCardForm } from "../components/UserCardForm";
import { CardRecommendation } from "../components/CardRecommendation";
import { CARDS } from "../data/cards";
import {
  getRecommendedCards,
  type RecommendationResult,
} from "../lib/compareCards";
import "../styles/CreditCard.css";

const DEFAULT_PROFILE: UserSpendingProfile = {
  rewardType: "miles",
  monthlySpend: 2000,
  primaryCategory: "online",
  spendBreakdown: {
    dining: 250,
    online: 1000,
    groceries: 250,
    travel: 250,
    general: 250,
  },
  useDetailedBreakdown: false,
};

export function CreditCard() {
  const [profile, setProfile] = useState<UserSpendingProfile>(DEFAULT_PROFILE);
  const [recommendations, setRecommendations] = useState<
    RecommendationResult[]
  >([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateRecommendations = () => {
    const results = getRecommendedCards(CARDS, profile);
    setRecommendations(results);
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
          recommendations={recommendations}
          hasGenerated={hasGenerated}
        />
      </div>
    </div>
  );
}
export default CreditCard;
