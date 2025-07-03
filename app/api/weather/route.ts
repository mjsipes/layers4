// app/api/weather/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VISUAL_CROSSING_API_KEY = process.env.VISUAL_CROSSING_API_KEY;
const VISUAL_CROSSING_BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

// Helper: round number to fixed decimals
function round(num: number, decimals: number): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude, date, unitGroup = "us" } = await req.json();

    if (!latitude || !longitude || !date) {
      console.warn("⚠️ Missing parameters:", { latitude, longitude, date });
      return NextResponse.json(
        { error: "Missing required parameters: latitude, longitude, date" },
        { status: 400 }
      );
    }

    if (!VISUAL_CROSSING_API_KEY) {
      console.error("❌ Missing Visual Crossing API key");
      return NextResponse.json(
        { error: "Visual Crossing API key not configured" },
        { status: 500 }
      );
    }

    const roundedLat = round(latitude, 2);
    const roundedLon = round(longitude, 2);

    console.log(`📍 Rounded location: (${roundedLat}, ${roundedLon}), date: ${date}`);

    const supabase = await createClient();

    // Step 1: Check if cached in DB
    const { data: existing, error: fetchError } = await supabase
      .from("weather")
      .select("weather_data")
      .eq("latitude", roundedLat)
      .eq("longitude", roundedLon)
      .eq("date", date)
      .maybeSingle();

    if (fetchError) {
      console.error("⚠️ Supabase fetch error:", fetchError.message);
    }

    if (existing) {
      console.log("✅ Returning cached weather data from Supabase");
      return NextResponse.json(existing.weather_data);
    }

    // Step 2: Fetch from Visual Crossing
    console.log("🌐 Fetching new weather data from Visual Crossing API...");

    const weatherUrl = `${VISUAL_CROSSING_BASE_URL}/${roundedLat},${roundedLon}/${date}?unitGroup=${unitGroup}&key=${VISUAL_CROSSING_API_KEY}&contentType=json&include=days`;

    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error(`Visual Crossing API error: ${response.status}`);
    }

    const weatherData = await response.json();

    // Step 3: Insert into Supabase for caching
    const { error: insertError } = await supabase.from("weather").insert({
      latitude: roundedLat,
      longitude: roundedLon,
      date,
      weather_data: weatherData,
    });

    if (insertError) {
      console.error("⚠️ Supabase insert error:", insertError.message);
    } else {
      console.log("📦 Weather data cached in Supabase");
    }

    return NextResponse.json(weatherData);
  } catch (error: unknown) {
    let message = "An unknown error occurred";
    if (error instanceof Error) {
      message = error.message;
    }

    console.error("❌ API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
