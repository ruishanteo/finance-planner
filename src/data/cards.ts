import type { CardProduct } from "../types";

/**
 * Singapore high-rewards credit cards database.
 * Includes precise minimum spend tiers, category bonus rates, reward caps, and annual fees.
 */
export const CARDS: CardProduct[] = [
  {
    id: "uob-one",
    name: "UOB One",
    annualFee: 192.6,
    network: "Mastercard",
    rewardType: "cashback",
    isUobOneSpecial: true,
    rewardComponents: [
      { id: "one-tier-1", minimumSpend: 500, cashbackRate: 0.0333 },
      { id: "one-tier-2", minimumSpend: 1000, cashbackRate: 0.0333 },
      { id: "one-tier-3", minimumSpend: 2000, cashbackRate: 0.0333 },
    ],
    spendCategories: "general",
    notes:
      "Earns flat monthly rebates of $16.67, $33.33, or $66.67 when you hit monthly spend tiers of $500, $1,000, or $2,000. Up to 10% on Shopee, Grab, Dairy Farm Group, and SimplyGo.",
  },
  {
    id: "ocbc-365",
    name: "OCBC 365",
    annualFee: 162.0,
    network: "Visa",
    rewardType: "cashback",
    rewardCap: 80, // $80/month overall cashback cap
    rewardComponents: [
      {
        id: "ocbc-365-base",
        minimumSpend: 0,
        cashbackRate: 0.003,
      },
      {
        id: "ocbc-365-bonus",
        minimumSpend: 800,
        cashbackRate: 0.003,
        categoryRates: {
          dining: 0.05, // 5% dining (6% for delivery, simplified to 5%)
          groceries: 0.03, // 3% groceries
          travel: 0.03, // 3% land transport, travel, online travel
          online: 0.03, // online travel/shopping
        },
      },
    ],
    spendCategories: "dining",
    notes:
      "5% cashback on dining, 3% on groceries, land transport, travel, and utilities. Requires minimum spend of $800/month, capped at $80/month.",
  },
  {
    id: "citi-cashback",
    name: "Citi Cash Back",
    annualFee: 196.2,
    network: "Mastercard",
    rewardType: "cashback",
    rewardComponents: [
      {
        id: "citi-cb-base",
        minimumSpend: 0,
        cashbackRate: 0.0025,
      },
      {
        id: "citi-cb-bonus",
        minimumSpend: 800,
        cashbackRate: 0.0025,
        categoryRates: {
          dining: 0.08, // 8% dining
          groceries: 0.08, // 8% groceries
          travel: 0.08, // 8% petrol (mapped to travel)
        },
        categoryCap: 25, // Capped at $25 cashback per category per month
      },
    ],
    spendCategories: "dining",
    notes:
      "8% cashback on dining, groceries, and petrol (travel). Requires $800 minimum spend. Cashback is capped at $25 per category per month.",
  },
  {
    id: "citi-cashback-plus",
    name: "Citi Cash Back+",
    annualFee: 196.2,
    network: "Mastercard",
    rewardType: "cashback",
    rewardComponents: [
      {
        id: "citi-cb-plus-base",
        minimumSpend: 0,
        cashbackRate: 0.016,
      },
    ],
    spendCategories: "general",
    notes:
      "1.6% flat cashback on all spend. No minimum spend and no reward cap.",
  },
  {
    id: "scb-simply-cash",
    name: "SCB Simply Cash",
    annualFee: 196.2,
    network: "Mastercard",
    rewardType: "cashback",
    rewardComponents: [
      {
        id: "scb-simply-cash-base",
        minimumSpend: 0,
        cashbackRate: 0.015,
      },
    ],
    spendCategories: "general",
    notes:
      "1.5% flat cashback on all spend. No minimum spend and no reward cap.",
  },
  {
    id: "citi-rewards",
    name: "Citi Rewards",
    annualFee: 196.2,
    network: "Mastercard",
    rewardType: "miles",
    rewardComponents: [
      {
        id: "citi-rewards-base",
        minimumSpend: 0,
        milesPerDollar: 0.4,
        categoryRates: {
          online: 4.0,
        },
        categoryCap: 1000, // Capped at $1,000 spend/month for 4 mpd bonus
      },
    ],
    spendCategories: "online",
    notes:
      "4.0 mpd on online transactions (excluding travel) and department stores. Capped at $1,000 spend/month. Often paired with Instarem Amaze for physical offline spend.",
  },
  {
    id: "hsbc-revolution",
    name: "HSBC Revolution",
    annualFee: 0,
    network: "Visa",
    rewardType: "miles",
    rewardComponents: [
      {
        id: "hsbc-rev-base",
        minimumSpend: 0,
        milesPerDollar: 0.4,
        categoryRates: {
          dining: 4.0,
          online: 4.0,
          groceries: 4.0,
          travel: 4.0,
        },
        categoryCap: 1000, // Capped at $1,000 spend/month for 4 mpd bonus
      },
    ],
    spendCategories: "online",
    notes:
      "4.0 mpd on contactless and online transactions (dining, shopping, travel, groceries). Capped at $1,000 spend/month. No annual fee.",
  },
  {
    id: "uob-ppv",
    name: "UOB Preferred Platinum Visa",
    annualFee: 192.6,
    network: "Visa",
    rewardType: "miles",
    rewardComponents: [
      {
        id: "uob-ppv-base",
        minimumSpend: 0,
        milesPerDollar: 0.4,
        categoryRates: {
          online: 4.0,
          dining: 4.0,
          groceries: 4.0,
        },
        categoryCap: 1110, // Capped at $1,110 spend/month for 4 mpd (UNI$2,000)
      },
    ],
    spendCategories: "online",
    notes:
      "4.0 mpd on mobile contactless payments and online shopping. Capped at $1,110 spend/month.",
  },
  {
    id: "citi-premiermiles",
    name: "Citi PremierMiles",
    annualFee: 196.2,
    network: "Visa",
    rewardType: "miles",
    rewardComponents: [
      {
        id: "citi-pm-base",
        minimumSpend: 0,
        milesPerDollar: 1.2,
        categoryRates: {
          travel: 2.0, // 2.0 mpd on overseas/travel spend
        },
      },
    ],
    spendCategories: "travel",
    notes:
      "1.2 mpd on local spend, 2.0 mpd on overseas/travel spend. Citi Miles never expire and includes 2 free airport lounge visits/year.",
  },
  {
    id: "uob-prvi-miles",
    name: "UOB PRVI Miles",
    annualFee: 259.2,
    network: "Mastercard",
    rewardType: "miles",
    rewardComponents: [
      {
        id: "uob-prvi-base",
        minimumSpend: 0,
        milesPerDollar: 1.4,
        categoryRates: {
          travel: 2.4, // 2.4 mpd on overseas/travel spend
        },
      },
    ],
    spendCategories: "travel",
    notes:
      "1.4 mpd on local spend, 2.4 mpd on overseas/travel spend. No minimum spend and no reward cap.",
  },
];
