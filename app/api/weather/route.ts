// app/api/weather/route.ts
import { NextRequest, NextResponse } from "next/server";

const VISUAL_CROSSING_API_KEY = process.env.VISUAL_CROSSING_API_KEY;
const VISUAL_CROSSING_BASE_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });
}

export async function POST(req: NextRequest) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  try {
    const { latitude, longitude, date, unitGroup = "us" } = await req.json();

    if (!latitude || !longitude || !date) {
      return NextResponse.json(
        { error: "Missing required parameters: latitude, longitude, date" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!VISUAL_CROSSING_API_KEY) {
      return NextResponse.json(
        { error: "Visual Crossing API key not configured" },
        { status: 500, headers: corsHeaders }
      );
    }

    const weatherUrl = `${VISUAL_CROSSING_BASE_URL}/${latitude},${longitude}/${date}?unitGroup=${unitGroup}&key=${VISUAL_CROSSING_API_KEY}&contentType=json&include=days`;

    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error(`Visual Crossing API error: ${response.status}`);
    }

    const weatherData = await response.json();
    return NextResponse.json(weatherData, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
