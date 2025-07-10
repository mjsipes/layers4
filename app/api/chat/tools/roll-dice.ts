import { tool } from "ai";
import { z } from "zod";

export const rollDiceTool = tool({
  description: "Roll a dice",
  parameters: z.object({
    sides: z
      .number()
      .min(2)
      .default(6)
      .describe("The number of sides on the dice"),
  }),
  execute: async ({ sides }) => {
    const value = 1 + Math.floor(Math.random() * sides);
    return `🎲 You rolled a ${value}!`;
  },
});
