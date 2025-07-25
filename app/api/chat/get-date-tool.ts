import { tool } from "ai";
import { z } from "zod";

export const getDateTool = tool({
  description: "Get the current date in YYYY-MM-DD format.",
  parameters: z.object({}),
  execute: async () => {
    const currentDate = new Date().toISOString().split("T")[0];
    return currentDate;
  },
}); 