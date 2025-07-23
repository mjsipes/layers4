import { tool } from "ai";
import { z } from "zod";

export const getWeatherTool = tool({
  description: "Get verbose weather data for a location",
  parameters: z.object({
    latitude: z.number().describe("The latitude of the location"),
    longitude: z.number().describe("The longitude of the location"),
  }),
  execute: async ({ latitude, longitude }) => {
    console.log("🔵 [GLOBAL] getWeatherTool", { latitude, longitude });
    const currentDate = new Date().toISOString().split("T")[0];

    try {
      console.log("Fetching weather for:", {
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
        console.log("🔴 [GLOBAL] Error from weather API", response);
        const errorText = await response.text();
        return `❌ Error from weather API: ${response.status} - ${errorText}`;
      }

      const weatherData = await response.json();
      console.log("Weather data:", weatherData);
      return `🌦️ Weather for ${currentDate} at (${latitude}, ${longitude}): ${JSON.stringify(
        weatherData
      )}`;
    } catch (error: unknown) {
      return `⚠️ Failed to fetch weather: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});
