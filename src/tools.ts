import { tool } from "@langchain/core/tools";
import { createRetrieverTool } from "@langchain/classic/tools/retriever";
import { vectorStore } from "./indexDocs";
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

const retriever = vectorStore.asRetriever();
export const knowledgeRetrieverTool = createRetrieverTool(retriever, {
  name: "retrieve_learning_knowledge_base",
  description: "Search and return information about system design",
});
