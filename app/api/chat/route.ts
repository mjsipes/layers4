// app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";
import { rollDiceTool} from "./tools/roll-dice";
import { getSecretTool} from "./tools/get-secret";
import { getWeatherTool } from "./tools/get-weather";

// const tools = [rollDiceTool, getSecretTool, getWeatherTool];

const tools = [{
    "type": "function",
    "name": "get_weather",
    "description": "Get current temperature for a given location.",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "City and country e.g. Bogotá, Colombia"
            }
        },
        "required": [
            "location"
        ],
        "additionalProperties": false
    }
}];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const systemPrompt = `You are a helpful AI assistant. You specialize in helping users decide what to wear based on the weather. `;
  const model = "gpt-4.1";
  const response = await openai.responses.create({
    model: model,
    input: systemPrompt + prompt,
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of response) {
          if (event.type === "response.output_text.delta" && event.delta) {
            const payload = {
              type: event.type,
              delta: event.delta,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Streaming error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: error instanceof Error ? error.message : String(error),
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
