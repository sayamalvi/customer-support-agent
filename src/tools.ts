import { tool } from "@langchain/core/tools";

export const getOffers = tool(
  () => {
    return JSON.stringify([
      {
        code: "LAUNCH",
        discount_percent: 30,
      },
      {
        code: "LAUNCH",
        discount_percent: 30,
      },
    ]);
  },
  {
    name: "offers_query_tool",
    description: "Call this tool to get the available discounts and offers",
  },
);
