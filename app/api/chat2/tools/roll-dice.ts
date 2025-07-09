export async function rollDice({ sides }: { sides: number }) {
  const value = 1 + Math.floor(Math.random() * sides);
  return `🎲 You rolled a ${value}!`;
}
