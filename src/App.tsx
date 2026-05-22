import { useMemo, useState } from 'react';
import { RecommendedPlan } from './components/RecommendedPlan';
import { UserProfileForm } from './components/UserProfileForm';
import { BANKS } from './data/banks';
import { optimizePortfolio } from './lib/optimizePortfolio';
import type { UserProfile } from './types';
import './App.css';

const DEFAULT_PROFILE: UserProfile = {
  totalBalance: 100_000,
  monthlySalary: 5_000,
  monthlySpend: 1_000,
  canSave: true,
  canInvest: false,
  canInsure: false,
  maxBanks: 3,
};

function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  const plan = useMemo(
    () => optimizePortfolio(BANKS, profile),
    [profile],
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>Savings interest optimizer</h1>
        <p>
          Enter your balance and monthly activities. We recommend how to split savings and
          card spend across Singapore bank products to maximise interest.
        </p>
      </header>

      <main className="layout optimizer-layout">
        <aside className="sidebar">
          <UserProfileForm profile={profile} onChange={setProfile} />
        </aside>

        <section className="main-content">
          <RecommendedPlan plan={plan} balance={profile.totalBalance} />
        </section>
      </main>
    </div>
  );
}

export default App;
