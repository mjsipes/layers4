import { tool } from "ai";
import { z } from "zod";

export const getWeatherTool = tool({
  description: "Get verbose weather data for a location",
  parameters: z.object({
    latitude: z.number().describe("The latitude of the location"),
    longitude: z.number().describe("The longitude of the location"),
  }),
  execute: async ({ latitude, longitude }) => {
    console.log("getWeatherTool:", { latitude, longitude });
    const currentDate = new Date().toISOString().split("T")[0];

    try {
      console.log("getWeatherTool: fetching weather for:", {
        latitude,
        longitude,
        date: currentDate,
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude,
            longitude,
            date: currentDate,
          }),
        }
      );

      if (!response.ok) {
        return await response.text();
      }

      const weatherData = await response.json();
      return weatherData;
    } catch (error: unknown) {
      console.log("getWeatherTool: failed to fetch weather:", error);
      return `⚠️ Failed to fetch weather: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});
