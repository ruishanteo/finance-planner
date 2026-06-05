import type { RecommendationResult } from "../lib/compareCards";
import type { CardProduct, CardRewardType, SpendCategories } from "../types";

interface CardRecommendationProps {
  recommendations: RecommendationResult[];
  hasGenerated: boolean;
}

function getCardRatesSummary(card: CardProduct): string {
  if (card.isUobOneSpecial) {
    return "Up to 3.33% flat base rebate + partner bonuses";
  }

  // Get rates from the bonus component (if it has categoryRates) or the first component
  const comp =
    card.rewardComponents.find((c) => c.categoryRates !== undefined) ||
    card.rewardComponents[0];
  const isMiles = card.rewardType === "miles";
  const unit = isMiles ? " mpd" : "%";

  const parts: string[] = [];

  if (comp.categoryRates) {
    Object.entries(comp.categoryRates).forEach(([cat, val]) => {
      const displayVal = isMiles ? val.toFixed(1) : (val * 100).toFixed(0);
      const cap = cat.charAt(0).toUpperCase() + cat.slice(1);
      parts.push(`${displayVal}${unit} ${cap}`);
    });
  }

  const baseVal = isMiles
    ? comp.milesPerDollar || 0.4
    : (comp.cashbackRate || 0.003) * 100;

  parts.push(
    `${isMiles ? baseVal.toFixed(1) : baseVal.toFixed(1)}${unit} General`,
  );

  return parts.join(" • ");
}

function formatRewardValue(value: number, rewardType: CardRewardType): string {
  if (rewardType === "cashback") {
    return `$${value.toFixed(2)} / month`;
  } else {
    return `${Math.round(value).toLocaleString()} miles / month`;
  }
}

function getNetworkIcon(network: string): string {
  const icons: Record<string, string> = {
    Visa: "💳",
    Mastercard: "💳",
    "American Express": "🔷",
    UnionPay: "🇨🇳",
  };
  return icons[network] || "💳";
}

const CATEGORIES: { key: SpendCategories; label: string; emoji: string }[] = [
  { key: "dining", label: "Dining", emoji: "🍜" },
  { key: "online", label: "Online Shopping", emoji: "🛍️" },
  { key: "groceries", label: "Groceries", emoji: "🛒" },
  { key: "travel", label: "Travel", emoji: "✈️" },
  { key: "general", label: "General Spend", emoji: "💳" },
];

export function CardRecommendation({
  recommendations,
  hasGenerated,
}: CardRecommendationProps) {
  if (!hasGenerated) {
    return (
      <section className="panel recommendations-panel empty-state">
        <div className="empty-state-content">
          <div className="empty-icon">💫</div>
          <h3>Ready to find your perfect card?</h3>
          <p>
            Fill in your spending profile on the left and click "Find my cards"
            to see personalized recommendations.
          </p>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return (
      <section className="panel recommendations-panel">
        <h2>📋 Recommendations</h2>
        <div className="no-results">
          <span className="no-results-icon">🔍</span>
          <p>
            No cards match your reward preference. Try switching between Miles
            and Cashback to see more options.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel recommendations-panel">
      <h2>
        📋 Top recommendations
        <span className="result-count">
          {recommendations.length} cards found
        </span>
      </h2>

      <div className="cards-list">
        {recommendations.map((rec, index) => {
          const { card, calculation } = rec;
          const {
            totalMonthlyReward,
            categoryRewards,
            isMinimumSpendMet,
            activeComponent,
          } = calculation;

          const hasBonusCategories = card.rewardComponents.some(
            (c) => c.categoryRates !== undefined,
          );
          const hasMinSpend = card.rewardComponents.some(
            (c) => c.minimumSpend > 0,
          );

          return (
            <div key={card.id} className="card-recommendation">
              <div className="card-rank">#{index + 1}</div>
              <div className="card-content">
                <div className="card-header-row">
                  <div>
                    <h3 className="card-name">{card.name}</h3>
                    <div className="card-meta">
                      <span className="network-badge">
                        {getNetworkIcon(card.network)} {card.network}
                      </span>
                      <span
                        className={`fee-badge ${card.annualFee === 0 ? "free" : ""}`}
                      >
                        {card.annualFee === 0
                          ? "No annual fee"
                          : `$${card.annualFee}/year`}
                      </span>
                    </div>
                  </div>
                  <div className="reward-badge" data-type={card.rewardType}>
                    {card.rewardType === "miles" ? "✈️ Miles" : "💰 Cashback"}
                  </div>
                </div>

                <div className="card-rates-summary">
                  📋 Rates:{" "}
                  <span className="rates-text">
                    {getCardRatesSummary(card)}
                  </span>
                </div>

                <div className="rewards-section">
                  <div className="reward-rate">
                    <span className="reward-label">Active Tier</span>
                    <span className="reward-value">
                      {activeComponent.minimumSpend > 0
                        ? `Spend ≥ $${activeComponent.minimumSpend}`
                        : "No minimum spend"}
                    </span>
                  </div>
                  <div className="monthly-value">
                    <span className="reward-label">Monthly reward value</span>
                    <span className="reward-value highlight">
                      {formatRewardValue(totalMonthlyReward, card.rewardType)}
                    </span>
                  </div>
                </div>

                {/* Category Earnings Breakdown */}
                <div className="earnings-breakdown-box">
                  <span className="breakdown-title">
                    🎁 Monthly Earnings Breakdown:
                  </span>
                  <div className="breakdown-grid">
                    {CATEGORIES.map(({ key, label, emoji }) => {
                      const reward = categoryRewards[key] || 0;
                      if (reward <= 0) return null;

                      const formatted =
                        card.rewardType === "cashback"
                          ? `$${reward.toFixed(2)}`
                          : `${Math.round(reward).toLocaleString()} miles`;

                      return (
                        <div key={key} className="breakdown-item">
                          <span className="item-label">
                            {emoji} {label}:
                          </span>
                          <span className="item-val">{formatted}</span>
                        </div>
                      );
                    })}
                    {Object.values(categoryRewards).every((v) => v <= 0) && (
                      <div className="breakdown-item empty">
                        <span className="item-val">
                          $0.00 (Spend is below thresholds)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Minimum Spend Eligibility Notification */}
                {hasMinSpend && (
                  <div
                    className={`status-badge ${isMinimumSpendMet ? "met" : "missed"}`}
                  >
                    {isMinimumSpendMet ? (
                      <span>✓ Minimum monthly spend requirement met</span>
                    ) : (
                      <span>
                        ⚠️ Spend at least $
                        {Math.min(
                          ...card.rewardComponents
                            .map((c) => c.minimumSpend)
                            .filter((m) => m > 0),
                        )}{" "}
                        to unlock bonus rates. (Earning base rate only)
                      </span>
                    )}
                  </div>
                )}

                {/* Category specific caps details */}
                {activeComponent.categoryCap !== undefined && (
                  <div className="cap-note">
                    📊 Bonus cap: Capped at{" "}
                    {card.rewardType === "miles"
                      ? `$${activeComponent.categoryCap} spend/month`
                      : `$${activeComponent.categoryCap} cashback/category/month`}
                  </div>
                )}

                {card.rewardCap !== undefined && !hasBonusCategories && (
                  <div className="cap-note">
                    📊 Monthly reward limit: Capped at{" "}
                    {card.rewardType === "cashback"
                      ? `$${card.rewardCap}`
                      : `${card.rewardCap.toLocaleString()} miles`}
                  </div>
                )}

                {card.notes && (
                  <div className="card-notes">💡 {card.notes}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
