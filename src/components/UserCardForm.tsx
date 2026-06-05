import type {
  CardRewardType,
  SpendCategories,
  UserSpendingProfile,
} from "../types";
import { getSpendBreakdown } from "../lib/compareCards";

interface UserCardFormProps {
  profile: UserSpendingProfile;
  onChange: (profile: UserSpendingProfile) => void;
  onGenerate: () => void;
}

const SPEND_CATEGORIES: {
  value: SpendCategories;
  label: string;
  emoji: string;
}[] = [
  { value: "dining", label: "Dining", emoji: "🍜" },
  { value: "online", label: "Online Shopping", emoji: "🛍️" },
  { value: "groceries", label: "Groceries", emoji: "🛒" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "general", label: "General Spend", emoji: "💳" },
];

export function UserCardForm({
  profile,
  onChange,
  onGenerate,
}: UserCardFormProps) {
  const update = (patch: Partial<UserSpendingProfile>) =>
    onChange({ ...profile, ...patch });

  const handleToggleDetailed = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      const currentBreakdown = getSpendBreakdown(profile);
      onChange({
        ...profile,
        useDetailedBreakdown: true,
        spendBreakdown: currentBreakdown,
      });
    } else {
      onChange({
        ...profile,
        useDetailedBreakdown: false,
      });
    }
  };

  const handleCategorySpendChange = (cat: SpendCategories, value: number) => {
    const nextBreakdown = {
      ...profile.spendBreakdown,
      [cat]: Math.max(0, value),
    };
    const nextTotal = Object.values(nextBreakdown).reduce(
      (sum, val) => sum + val,
      0,
    );
    onChange({
      ...profile,
      monthlySpend: nextTotal,
      spendBreakdown: nextBreakdown,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <section className="panel form-panel">
      <h2>Your spending profile</h2>
      <p className="hint">
        Tell us how you spend and what rewards you value most. We'll recommend
        cards that match your habits.
      </p>

      <form onSubmit={handleSubmit}>
        <fieldset className="radio-group-field">
          <legend>Reward preference</legend>
          <div className="radio-options">
            <label
              className={`radio-card ${profile.rewardType === "miles" ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="rewardType"
                value="miles"
                checked={profile.rewardType === "miles"}
                onChange={(e) =>
                  update({ rewardType: e.target.value as CardRewardType })
                }
              />
              <span className="radio-emoji">✈️</span>
              <span className="radio-label">Miles / Points</span>
              <span className="radio-desc">Best for frequent travellers</span>
            </label>
            <label
              className={`radio-card ${profile.rewardType === "cashback" ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="rewardType"
                value="cashback"
                checked={profile.rewardType === "cashback"}
                onChange={(e) =>
                  update({ rewardType: e.target.value as CardRewardType })
                }
              />
              <span className="radio-emoji">💰</span>
              <span className="radio-label">Cashback</span>
              <span className="radio-desc">
                Simple, straight-to-wallet savings
              </span>
            </label>
          </div>
        </fieldset>

        {/* Detailed Breakdown Toggle */}
        <div className="detailed-toggle-field">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={profile.useDetailedBreakdown}
              onChange={handleToggleDetailed}
            />
            <span className="toggle-custom"></span>
            <span className="toggle-text">Fine-tune category spending</span>
          </label>
        </div>

        {!profile.useDetailedBreakdown ? (
          <>
            <div className="field">
              <label htmlFor="monthlySpend">
                Monthly credit card spend (total)
              </label>
              <div className="input-wrapper">
                <span className="input-symbol">$</span>
                <input
                  id="monthlySpend"
                  type="number"
                  min={0}
                  step={50}
                  value={profile.monthlySpend || ""}
                  onChange={(e) =>
                    update({
                      monthlySpend: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                />
              </div>
              <span className="field-note">
                Total amount you spend on cards each month
              </span>
            </div>

            <div className="field">
              <label>Largest spending category</label>
              <div className="category-grid">
                {SPEND_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`category-option ${profile.primaryCategory === cat.value ? "active" : ""}`}
                    onClick={() => update({ primaryCategory: cat.value })}
                  >
                    <span className="cat-emoji">{cat.emoji}</span>
                    <span className="cat-label">{cat.label}</span>
                  </button>
                ))}
              </div>
              <span className="field-note">
                Cards that reward this category will be prioritized
              </span>
            </div>
          </>
        ) : (
          <div className="detailed-breakdown-section">
            <h3>Monthly Spending Breakdown</h3>
            <p className="hint">
              Adjust the spend for each category. Your total spend is
              automatically updated.
            </p>

            {SPEND_CATEGORIES.map((cat) => {
              const categorySpend = profile.spendBreakdown[cat.value] || 0;
              const total = profile.monthlySpend || 1;
              const pct = Math.round((categorySpend / total) * 100) || 0;

              return (
                <div key={cat.value} className="category-slider-field">
                  <div className="slider-header">
                    <span className="slider-title">
                      {cat.emoji} {cat.label}
                    </span>
                    <span className="slider-percentage">{pct}%</span>
                  </div>

                  <div className="slider-row">
                    <input
                      type="range"
                      min={0}
                      max={2000}
                      step={50}
                      value={categorySpend}
                      onChange={(e) =>
                        handleCategorySpendChange(
                          cat.value,
                          Number(e.target.value),
                        )
                      }
                      className="spend-slider"
                    />
                    <div className="slider-input-wrapper">
                      <span className="slider-currency">$</span>
                      <input
                        type="number"
                        min={0}
                        value={categorySpend || 0}
                        onChange={(e) =>
                          handleCategorySpendChange(
                            cat.value,
                            Number(e.target.value) || 0,
                          )
                        }
                        className="spend-num-input"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="total-display-box">
              <span className="total-label">Total Monthly Spend:</span>
              <span className="total-value">
                ${profile.monthlySpend.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary btn-generate">
          ✨ Find my cards ✨
        </button>
      </form>
    </section>
  );
}
