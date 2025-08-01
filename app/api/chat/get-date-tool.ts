import { tool } from "ai";
import { z } from "zod";

export const getDateTool = tool({
  description: "Get the current date in YYYY-MM-DD format.",
  parameters: z.object({}),
  execute: async () => {
    const now = new Date();
    const currentDate = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0');
    console.log("getDateTool: current date", currentDate);
    return currentDate;
  },
}); 