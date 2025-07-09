// ✅ Correct App Router-style for /app/api/chat2/route.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function GET() {
  const openai = new OpenAI();

  const tools = [
    {
      type: "function" as const,
      name: "get_weather",
      description: "Get current temperature for a given location.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "City and country e.g. Bogotá, Colombia",
          },
        },
        required: ["location"],
        additionalProperties: false,
      },
      strict: true,
    },
  ];
  

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input: [
      { role: "user", content: "what is the weather in sonoma?" },
    ],
    tools,
  });

  console.log(response.output);

  return NextResponse.json({ message: response.output });
}
