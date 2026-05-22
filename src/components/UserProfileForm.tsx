import type { UserProfile } from '../types';

interface UserProfileFormProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

export function UserProfileForm({ profile, onChange }: UserProfileFormProps) {
  const update = (patch: Partial<UserProfile>) => onChange({ ...profile, ...patch });

  return (
    <section className="panel profile-panel">
      <h2>Your profile</h2>
      <p className="hint">
        Enter what you can commit each month. The optimizer splits balance and spend across
        banks to maximise interest.
      </p>

      <div className="field">
        <label htmlFor="totalBalance">Total savings balance</label>
        <input
          id="totalBalance"
          type="number"
          min={0}
          step={1000}
          value={profile.totalBalance || ''}
          onChange={(e) => update({ totalBalance: Math.max(0, Number(e.target.value) || 0) })}
        />
      </div>

      <div className="field">
        <label htmlFor="monthlySalary">Monthly salary (GIRO)</label>
        <input
          id="monthlySalary"
          type="number"
          min={0}
          step={100}
          value={profile.monthlySalary || ''}
          onChange={(e) => update({ monthlySalary: Math.max(0, Number(e.target.value) || 0) })}
        />
        <span className="field-note">Credited to one account only</span>
      </div>

      <div className="field">
        <label htmlFor="monthlySpend">Monthly card spend (total)</label>
        <input
          id="monthlySpend"
          type="number"
          min={0}
          step={50}
          value={profile.monthlySpend || ''}
          onChange={(e) => update({ monthlySpend: Math.max(0, Number(e.target.value) || 0) })}
        />
        <span className="field-note">Can be split across banks (e.g. $500 + $500)</span>
      </div>

      <fieldset className="toggles">
        <legend>Also able to</legend>
        <label>
          <input
            type="checkbox"
            checked={profile.canSave}
            onChange={(e) => update({ canSave: e.target.checked })}
          />
          Save / grow balance monthly
        </label>
        <label>
          <input
            type="checkbox"
            checked={profile.canInvest}
            onChange={(e) => update({ canInvest: e.target.checked })}
          />
          Hold investments with bank
        </label>
        <label>
          <input
            type="checkbox"
            checked={profile.canInsure}
            onChange={(e) => update({ canInsure: e.target.checked })}
          />
          Maintain insurance with bank
        </label>
      </fieldset>

      <div className="field">
        <label htmlFor="maxBanks">Max accounts willing to open</label>
        <input
          id="maxBanks"
          type="number"
          min={1}
          max={5}
          value={profile.maxBanks}
          onChange={(e) =>
            update({ maxBanks: Math.min(5, Math.max(1, Number(e.target.value) || 1)) })
          }
        />
      </div>
    </section>
  );
}
