import type { ActivityMeta } from "../types";

export const ACTIVITIES: ActivityMeta[] = [
  {
    key: "salary",
    label: "Salary credit",
    description: "GIRO salary into this account each month",
  },

  {
    key: "save",
    label: "Save",
    description:
      "Increase monthly balance or maintain qualifying GIRO activity",
  },

  {
    key: "spend",
    label: "Spend",
    description: "Meet monthly eligible card spend requirement",
  },

  {
    key: "invest",
    label: "Invest",
    description: "Hold eligible investments with the bank",
  },

  {
    key: "insure",
    label: "Insure",
    description: "Maintain eligible insurance policies",
  },
];
