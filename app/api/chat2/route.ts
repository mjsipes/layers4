/* eslint-disable */
// @ts-nocheck
// ✅ Correct App Router-style for /app/api/chat2/route.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getWeather } from "./tools/get-weather";

export async function GET() {
  const openai = new OpenAI();

  const tools = [
    {
      type: "function",
      name: "get_weather",
      description:
        "Get current temperature for provided coordinates in celsius.",
      parameters: {
        type: "object",
        properties: {
          latitude: { type: "number" },
          longitude: { type: "number" },
          date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        },
        required: ["latitude", "longitude"],
        additionalProperties: false,
      },
      strict: true,
    },
  ];

  const input = [
    {
      role: "user",
      content: "What's the weather like in Paris today?",
    },
  ];

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input,
    tools,
  });

  console.log(response.output);

  return NextResponse.json({ message: response.output });
}
