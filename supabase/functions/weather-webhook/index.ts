// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

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
  console.log("weather-webhook/index.ts webhook triggered for log:", id, "on", date,  "at", latitude, longitude, "with weather:", weather_id);

  if (date && latitude && longitude){
    // get weather for this log
    //create supabase client
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization")
        }
      }
    });
    //first check if weather exists for this log
    const roundedLat = round(latitude, 2);
    const roundedLon = round(longitude, 2);
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
      //create weather record
      const weatherUrl = `${VISUAL_CROSSING_BASE_URL}/${roundedLat},${roundedLon}/${date}?unitGroup=us&key=${VISUAL_CROSSING_API_KEY}&contentType=json&include=days`;
      const response = await fetch(weatherUrl);
      const weatherData = await response.json();
      console.log("weather-webhook/index.ts weather data:", weatherData);
      //insert weather record
             const { data: newWeather, error: insertError } = await supabase
       .from("weather")
       .insert({ latitude: roundedLat, longitude: roundedLon, date: date, weather_data: weatherData })
       .select();
      if (insertError) {
        console.error("weather-webhook/index.ts error inserting weather record:", insertError);
      } else {
        console.log("weather-webhook/index.ts weather record inserted:", newWeather);
        weather_id = newWeather.id;
      }
    }
    //update log with weather_id
    const { data: updated, error: updateError } = await supabase
    .from("log")
    .update({ weather_id: weather_id })
    .eq("id", id);
    if (updateError) {
      console.error("weather-webhook/index.ts error updating log:", updateError);
    } else {
      console.log("weather-webhook/index.ts log updated with weather_id:", weather_id);
    }
  } else {
    console.error("weather-webhook/index.ts missing required parameters:", { date, latitude, longitude });
  }


  return new Response(
    null,
    { status: 200 }
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/weather-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
