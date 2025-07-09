export async function getWeather({ 
  latitude, 
  longitude, 
  date 
}: { 
  latitude: number; 
  longitude: number; 
  date?: string; 
}) {
  // Default to current date if not provided
  const currentDate = date || new Date().toISOString().split('T')[0];
  
  try {
    console.log("Fetching weather for:", { latitude, longitude, date: currentDate });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude, date: currentDate }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return `❌ Error from weather API: ${response.status} - ${errorText}`;
    }

    const weatherData = await response.json();
    console.log("Weather data:", weatherData);
    return `🌦️ Weather for ${currentDate} at (${latitude}, ${longitude}): ${JSON.stringify(weatherData)}`;
  } catch (error: unknown) {
    return `⚠️ Failed to fetch weather: ${error instanceof Error ? error.message : String(error)}`;
  }
}
