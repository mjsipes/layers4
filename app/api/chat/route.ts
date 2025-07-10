import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { rollDiceTool } from "./tools/roll-dice";
import { getWeatherTool } from "./tools/get-weather";
import { selectLayersTool, insertLayerTool } from "./tools/layers";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    tools: {
      roll_dice: rollDiceTool,
      get_weather: getWeatherTool,
      select_layers: selectLayersTool,
      insert_layer: insertLayerTool,
    },
  });

  return result.toDataStreamResponse();
}
