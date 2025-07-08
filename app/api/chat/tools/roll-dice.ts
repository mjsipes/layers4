export const rollDiceTool = {
  type: "function" as const,
  name: "roll_dice",
  description: "Rolls an N-sided die",
  parameters: {
    type: "object",
    properties: {
      sides: {
        type: "number",
        description: "Number of sides on the die (minimum 2)",
        minimum: 2
      }
    },
    required: ["sides"],
    additionalProperties: false
  },
  strict: false
};

export async function executeRollDice({ sides }: { sides: number }) {
  const value = 1 + Math.floor(Math.random() * sides);
  return `🎲 You rolled a ${value}!`;
}
