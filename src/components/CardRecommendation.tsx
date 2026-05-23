import type { CardProduct, CardRewardType } from "../types";

interface CardRecommendationProps {
  cards: CardProduct[];
  hasGenerated: boolean;
  userSpend: number;
}

function getRewardRateDisplay(card: CardProduct, monthlySpend: number): string {
  if (card.rewardType === "cashback") {
    const cashbackComp = card.rewardComponents.find(
      (c) => c.cashbackRate !== undefined && monthlySpend >= c.minimumSpend,
    );
    const bestRate =
      cashbackComp?.cashbackRate ||
      card.rewardComponents.find(
        (c) => c.cashbackRate !== undefined && c.minimumSpend === 0,
      )?.cashbackRate ||
      0;
    return `${(bestRate * 100).toFixed(1)}% cashback`;
  } else {
    const milesComp = card.rewardComponents.find(
      (c) => c.milesPerDollar !== undefined && monthlySpend >= c.minimumSpend,
    );
    const bestRate =
      milesComp?.milesPerDollar ||
      card.rewardComponents.find(
        (c) => c.milesPerDollar !== undefined && c.minimumSpend === 0,
      )?.milesPerDollar ||
      0;
    return `${bestRate.toFixed(1)}x miles`;
  }
}

// Calculate monthly reward value
function getMonthlyRewardValue(
  card: CardProduct,
  monthlySpend: number,
): number {
  if (card.rewardType === "cashback") {
    const cashbackComp = card.rewardComponents.find(
      (c) => c.cashbackRate !== undefined && monthlySpend >= c.minimumSpend,
    );
    const rate =
      cashbackComp?.cashbackRate ||
      card.rewardComponents.find(
        (c) => c.cashbackRate !== undefined && c.minimumSpend === 0,
      )?.cashbackRate ||
      0;
    let value = monthlySpend * rate;
    if (card.rewardCap) value = Math.min(value, card.rewardCap);
    return value;
  } else {
    const milesComp = card.rewardComponents.find(
      (c) => c.milesPerDollar !== undefined && monthlySpend >= c.minimumSpend,
    );
    const rate =
      milesComp?.milesPerDollar ||
      card.rewardComponents.find(
        (c) => c.milesPerDollar !== undefined && c.minimumSpend === 0,
      )?.milesPerDollar ||
      0;
    let miles = monthlySpend * rate;
    if (card.rewardCap) miles = Math.min(miles, card.rewardCap);
    return miles;
  }
}

function formatRewardValue(value: number, rewardType: CardRewardType): string {
  if (rewardType === "cashback") {
    return `$${value.toFixed(0)} / month`;
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

export function CardRecommendation({
  cards,
  hasGenerated,
  userSpend,
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

  if (cards.length === 0) {
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
        <span className="result-count">{cards.length} cards found</span>
      </h2>

      <div className="cards-list">
        {cards.map((card, index) => {
          const monthlyReward = getMonthlyRewardValue(card, userSpend);
          const rewardRateDisplay = getRewardRateDisplay(card, userSpend);
          const meetsMinSpend = card.rewardComponents.some(
            (c) => c.minimumSpend > 0 && userSpend >= c.minimumSpend,
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

                <div className="rewards-section">
                  <div className="reward-rate">
                    <span className="reward-label">Earn rate</span>
                    <span className="reward-value">{rewardRateDisplay}</span>
                  </div>
                  <div className="monthly-value">
                    <span className="reward-label">Monthly reward value</span>
                    <span className="reward-value highlight">
                      {formatRewardValue(monthlyReward, card.rewardType)}
                    </span>
                  </div>
                </div>

                {card.rewardComponents.length > 1 && (
                  <div className="tiers-section">
                    <span className="tiers-label">🏆 Bonus tiers:</span>
                    <div className="tiers-list">
                      {card.rewardComponents
                        .map((comp) => {
                          if (comp.minimumSpend === 0) return null;
                          const rewardText =
                            card.rewardType === "cashback"
                              ? `${((comp.cashbackRate || 0) * 100).toFixed(1)}%`
                              : `${comp.milesPerDollar}x miles`;
                          return (
                            <span
                              key={comp.id}
                              className={`tier ${userSpend >= comp.minimumSpend ? "active" : ""}`}
                            >
                              {rewardText} ≥ ${comp.minimumSpend}
                            </span>
                          );
                        })
                        .filter(Boolean)}
                    </div>
                  </div>
                )}

                {!meetsMinSpend &&
                  card.rewardComponents.some((c) => c.minimumSpend > 0) && (
                    <div className="warning-note">
                      ⚡ Spend $
                      {Math.min(
                        ...card.rewardComponents
                          .map((c) => c.minimumSpend)
                          .filter((m) => m > 0),
                      )}{" "}
                      to unlock bonus rate
                    </div>
                  )}

                {card.rewardCap && (
                  <div className="cap-note">
                    📊 Annual reward cap:{" "}
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
