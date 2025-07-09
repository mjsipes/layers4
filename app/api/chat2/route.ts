/* eslint-disable */
// @ts-nocheck
// ✅ Correct App Router-style for /app/api/chat2/route.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getWeather } from "./tools/get-weather";
import { rollDice } from "./tools/roll-dice";

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
        required: ["latitude", "longitude", "date"],
        additionalProperties: false,
      },
      strict: true,
    },
    {
      type: "function",
      name: "roll_dice",
      description: "Rolls an N-sided die",
      parameters: {
        type: "object",
        properties: {
          sides: {
            type: "number",
            description: "Number of sides on the die (minimum 2)",
            minimum: 2
          }
        },
        required: ["sides"],
        additionalProperties: false,
      },
      strict: true,
    },
  ];

  const input = [
    {
      role: "user",
      content: "can you roll a die for me and get the weather in paris france?",
    },
  ];

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input,
    tools,
  });

  console.log("\nopenai response1.output:", response.output);
  const toolCall = response.output[0];
  console.log("\nopenai toolcall:", toolCall);
  if(toolCall.type == "message") {
    return NextResponse.json({ message: toolCall.content });
  }
  const args = JSON.parse(toolCall.arguments);
  console.log("\nopenai args:", args);

  let result;
  if (toolCall.name === "get_weather") {
    result = await getWeather({
      latitude: args.latitude,
      longitude: args.longitude,
      date: args.date,
    });
  } else if (toolCall.name === "roll_dice") {
    result = await rollDice({
      sides: args.sides,
    });
  }

  input.push(toolCall); // append model's function call message
  input.push({
    type: "function_call_output",
    call_id: toolCall.call_id,
    output: result.toString(),
  });

  console.log("\ninput after appending tool call and result:", input);

  const response2 = await openai.responses.create({
    model: "gpt-4.1",
    input,
    tools,
    store: true,
  });

  console.log("\nresponse2.output:", response2.output);

  return NextResponse.json({ message: response2.output });
}
