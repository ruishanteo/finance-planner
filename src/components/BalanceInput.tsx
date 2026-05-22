interface BalanceInputProps {
  balance: number;
  onChange: (balance: number) => void;
}

const PRESETS = [5_000, 20_000, 50_000, 100_000, 250_000];

export function BalanceInput({ balance, onChange }: BalanceInputProps) {
  return (
    <section className="panel balance-panel">
      <h2>Savings balance</h2>
      <p className="hint">Amount you plan to keep in the account for interest calculation.</p>

      <div className="balance-row">
        <label htmlFor="balance">Balance</label>
        <input
          id="balance"
          type="number"
          min={0}
          step={1000}
          value={balance || ''}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>

      <div className="preset-row">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={balance === preset ? 'preset active' : 'preset'}
            onClick={() => onChange(preset)}
          >
            ${(preset / 1000).toFixed(0)}k
          </button>
        ))}
      </div>
    </section>
  );
}
