// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2";

console.log("Hello from Functions!")

const VISUAL_CROSSING_API_KEY = Deno.env.get("VISUAL_CROSSING_API_KEY");
const VISUAL_CROSSING_BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

function round(num: number, decimals: number): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

Deno.serve(async (req) => {
  const payload = await req.json();
  console.log("weather-webhook/index.ts echo POST:", payload);

  const id = payload.record.id;
  const date = payload.record.date;
  const latitude = payload.record.latitude;
  const longitude = payload.record.longitude;
  let weather_id = payload.record.weather_id;

  const oldDate = payload.old_record?.date;
  const oldLat = payload.old_record?.latitude;
  const oldLon = payload.old_record?.longitude;

  // Early exit if lat/lon/date are unchanged
  if (
    date === oldDate &&
    round(latitude, 2) === round(oldLat, 2) &&
    round(longitude, 2) === round(oldLon, 2)
  ) {
    console.log("weather-webhook/index.ts lat/lon/date unchanged — skipping.");
    return new Response(null, { status: 200 });
  }

  console.log("weather-webhook/index.ts webhook triggered for log:", id, "on", date, "at", latitude, longitude, "with weather:", weather_id);

  if (date && latitude && longitude) {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization"),
          },
        },
      }
    );

    const roundedLat = round(latitude, 2);
    const roundedLon = round(longitude, 2);

    // Check if weather already exists
    const { data: existing, error: fetchError } = await supabase
      .from("weather")
      .select("*")
      .eq("latitude", roundedLat)
      .eq("longitude", roundedLon)
      .eq("date", date)
      .maybeSingle();

    if (existing) {
      console.log("weather-webhook/index.ts weather already exists for this log:", existing);
      weather_id = existing.id;
    } else {
      console.log("weather-webhook/index.ts weather does not exist for this log");
      const weatherUrl = `${VISUAL_CROSSING_BASE_URL}/${roundedLat},${roundedLon}/${date}?unitGroup=us&key=${VISUAL_CROSSING_API_KEY}&contentType=json&include=days`;
      const response = await fetch(weatherUrl);
      const weatherData = await response.json();
      console.log("weather-webhook/index.ts weather data:", weatherData);

      const { data: newWeather, error: insertError } = await supabase
        .from("weather")
        .insert({ latitude: roundedLat, longitude: roundedLon, date: date, weather_data: weatherData })
        .select();

      if (insertError) {
        console.error("weather-webhook/index.ts error inserting weather record:", insertError);
      } else {
        console.log("weather-webhook/index.ts weather record inserted:", newWeather);
        weather_id = newWeather[0]?.id;
      }
    }

    // Update log with new weather_id
    const { data: updated, error: updateError } = await supabase
      .from("log")
      .update({ weather_id: weather_id })
      .eq("id", id);

    if (updateError) {
      console.error("weather-webhook/index.ts error updating log:", updateError);
    } else {
      console.log("weather-webhook/index.ts log updated with weather_id:", updated);
    }
  } else {
    console.error("weather-webhook/index.ts missing required parameters:", { date, latitude, longitude });
  }

  return new Response(null, { status: 200 });
});
