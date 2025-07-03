// app/api/weather/route.ts
import { NextRequest, NextResponse } from "next/server";

const VISUAL_CROSSING_API_KEY = process.env.VISUAL_CROSSING_API_KEY;
const VISUAL_CROSSING_BASE_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude, date, unitGroup = "us" } = await req.json();

    if (!latitude || !longitude || !date) {
      return NextResponse.json(
        { error: "Missing required parameters: latitude, longitude, date" },
        { status: 400 }
      );
    }

    if (!VISUAL_CROSSING_API_KEY) {
      return NextResponse.json(
        { error: "Visual Crossing API key not configured" },
        { status: 500 }
      );
    }

    const weatherUrl = `${VISUAL_CROSSING_BASE_URL}/${latitude},${longitude}/${date}?unitGroup=${unitGroup}&key=${VISUAL_CROSSING_API_KEY}&contentType=json&include=days`;

    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error(`Visual Crossing API error: ${response.status}`);
    }

    const weatherData = await response.json();
    return NextResponse.json(weatherData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
