import { z } from "zod";
import { createMcpHandler } from "@vercel/mcp-adapter";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "roll_dice",
      "Rolls an N-sided die",
      { sides: z.number().int().min(2) },
      async ({ sides }) => {
        const value = 1 + Math.floor(Math.random() * sides);
        return {
          content: [{ type: "text", text: `🎲 You rolled a ${value}!` }],
        };
      }
    );

    server.tool("get_secret", "Returns a secret value", {}, async () => {
      return {
        content: [{ type: "text", text: "🔐 Secret: abc123" }],
      };
    });
    server.tool(
      "get_weather",
      "Gets weather data for a given location and date",
      {
        latitude: z.number(),
        longitude: z.number(),
        date: z.string(), // ISO date string: YYYY-MM-DD
      },
      async ({ latitude, longitude, date }) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ latitude, longitude, date }),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            return {
              content: [
                {
                  type: "text",
                  text: `❌ Error from weather API: ${response.status} - ${errorText}`,
                },
              ],
            };
          }

          const weatherData = await response.json();
          return {
            content: [
              {
                type: "text",
                text: `🌦️ Weather for ${date} at (${latitude}, ${longitude}): ${JSON.stringify(
                  weatherData
                )}`,
              },
            ],
          };
        } catch (error: unknown) {
          return {
            content: [
              {
                type: "text",
                text: `⚠️ Failed to fetch weather: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      }
    );
  },
  {},
  { basePath: "/api" }
);

export { handler as GET, handler as POST, handler as DELETE };
