export const getWeatherTool = {
  type: "function" as const,
  name: "get_weather",
  description: "Gets weather data for a given location and date",
  parameters: {
    type: "object",
    properties: {
      latitude: {
        type: "number",
        description: "Latitude coordinate"
      },
      longitude: {
        type: "number", 
        description: "Longitude coordinate"
      },
      date: {
        type: "string",
        description: "ISO date string in YYYY-MM-DD format"
      }
    },
    required: ["latitude", "longitude", "date"],
    additionalProperties: false
  },
  strict: false
};

export async function executeGetWeather({ 
  latitude, 
  longitude, 
  date 
}: { 
  latitude: number; 
  longitude: number; 
  date: string; 
}) {
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
      return `❌ Error from weather API: ${response.status} - ${errorText}`;
    }

    const weatherData = await response.json();
    console.log("Weather data:", weatherData);
    return `🌦️ Weather for ${date} at (${latitude}, ${longitude}): ${JSON.stringify(weatherData)}`;
  } catch (error: unknown) {
    return `⚠️ Failed to fetch weather: ${error instanceof Error ? error.message : String(error)}`;
  }
}
