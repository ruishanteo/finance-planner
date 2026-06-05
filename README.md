# Savings Interest Optimizer

Recommends how to split your savings balance and monthly activities (salary, card spend, save, invest, insure) across Singapore bank products to **maximise total interest**.

## Run locally

```bash
npm install
npm run dev
```

## How it works

1. **Profile** — total balance, monthly salary, monthly card spend, optional save/invest/insure, max number of accounts.
2. **Optimizer** — tries single-bank and multi-bank combinations (up to `maxBanks`):
   - Assigns salary to one qualifying bank
   - Assigns save / invest / insure to banks where each bonus adds the most marginal interest
   - Splits card spend (e.g. $500 + $500) when two banks’ minimum spends are met
   - Water-fills balance into highest-rate caps first
3. **Plan** — table of accounts, balances, activities, and projected annual interest vs best single-bank baseline.

## Architecture

| Layer                          | Role                                      |
| ------------------------------ | ----------------------------------------- |
| `src/data/banks.ts`            | Product rules (scenarios, tiered bonuses) |
| `src/lib/calculateInterest.ts` | Interest for one account slice            |
| `src/lib/optimizePortfolio.ts` | Portfolio search across banks             |
| `src/components/`              | Profile form + recommended plan UI        |

## Bank calculation modes

- **published-scenario** — comparison-site headline rate × capped balance
- **additive-bonuses** — OCBC: independent stackable bonuses with per-activity tiers
- **scenario-plus-bonuses** — optional hybrid (unused in current data)

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run test` — unit tests

## Data Accuracy

Data manually verified as of 22 May 2026 for the below bank products:

- OCBC 360
- UOB One
- DBS Multiplier
- SC BonusSaver
- Maybank Save Up
- UOB Stash

Yet to verify card product details.
